# =============================================================================
# AmsirarTrip — Cloudflare Edge Security Rulesets (Terraform IaC)
#
# Covers:
#   1. Origin Protection (X-Origin-Verify header + header stripping)
#   2. Canonical Redirect (www.amsirartrip.com -> https://amsirartrip.com)
#   3. Custom WAF Rules (Free-tier 5-rule budget + Pro+ static skip)
#   4. Managed WAF Rulesets (Pro+: Cloudflare Managed + OWASP CRS PL1 multilingual-safe)
#   5. Edge Rate Limiting (Free: 1 rule | Pro+: 3 granular rules w/ NAT-safe characteristics)
#   6. Cache Rules (Bypass /_actions/*, cache immutable assets, catalog JSON, & hash-CSP HTML)
#   7. Baseline Edge Response Security Headers (without duplicating origin CSP)
#
# Usage:
#   terraform init
#   terraform plan \
#     -var="zone_id=<CLOUDFLARE_ZONE_ID>" \
#     -var="origin_verify_secret=<64_HEX_CHAR_SECRET>" \
#     -var="cloudflare_plan=free" # or "pro"
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }
}

variable "zone_id" {
  type        = string
  description = "Cloudflare Zone ID for amsirartrip.com"
}

variable "origin_verify_secret" {
  type        = string
  sensitive   = true
  description = "64-char random hex secret matching ORIGIN_VERIFY_SECRET on the Node origin"
}

variable "cloudflare_plan" {
  type        = string
  default     = "free"
  description = "Cloudflare plan tier: 'free' or 'pro' (also covers Business/Enterprise)"
  validation {
    condition     = contains(["free", "pro"], var.cloudflare_plan)
    error_message = "cloudflare_plan must be 'free' or 'pro'."
  }
}

variable "owasp_action" {
  type        = string
  default     = "log"
  description = "OWASP CRS anomaly threshold action: start with 'log' for 14 days, then 'managed_challenge'"
  validation {
    condition     = contains(["log", "managed_challenge", "block"], var.owasp_action)
    error_message = "owasp_action must be 'log', 'managed_challenge', or 'block'."
  }
}

# ─── 1. Origin Authentication Header Transform Rule ───────────────────────────
resource "cloudflare_ruleset" "origin_auth_header" {
  zone_id = var.zone_id
  name    = "AmsirarTrip Origin Auth Header"
  kind    = "zone"
  phase   = "http_request_late_transform"

  rules {
    action      = "rewrite"
    description = "Inject X-Origin-Verify secret and strip spoofable rewrite headers"
    expression  = "true"
    enabled     = true
    action_parameters {
      headers {
        name      = "X-Origin-Verify"
        operation = "set"
        value     = var.origin_verify_secret
      }
      headers {
        name      = "X-Original-URL"
        operation = "remove"
      }
      headers {
        name      = "X-Rewrite-URL"
        operation = "remove"
      }
    }
  }
}

# ─── 2. Canonical Host Redirect (www -> apex) ─────────────────────────────────
resource "cloudflare_ruleset" "canonical_redirect" {
  zone_id = var.zone_id
  name    = "AmsirarTrip Canonical Redirect"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules {
    action      = "redirect"
    description = "301 redirect www.amsirartrip.com to apex"
    expression  = "http.host eq \"www.amsirartrip.com\""
    enabled     = true
    action_parameters {
      from_value {
        status_code           = 301
        preserve_query_string = true
        target_url {
          expression = "concat(\"https://amsirartrip.com\", http.request.uri.path)"
        }
      }
    }
  }
}

# ─── 3. Custom WAF Rules (Free-compatible Wirefilter; zero geo-blocking) ──────
resource "cloudflare_ruleset" "waf_custom" {
  zone_id = var.zone_id
  name    = "AmsirarTrip Custom WAF"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  dynamic "rules" {
    for_each = var.cloudflare_plan == "pro" ? [1] : []
    content {
      action      = "skip"
      description = "Skip Managed WAF on immutable static assets"
      expression  = "http.request.method in {\"GET\" \"HEAD\"} and (starts_with(http.request.uri.path, \"/_astro/\") or starts_with(http.request.uri.path, \"/images/\") or starts_with(http.request.uri.path, \"/videos/\") or starts_with(http.request.uri.path, \"/fonts/\") or starts_with(http.request.uri.path, \"/icons/\") or starts_with(http.request.uri.path, \"/patterns/\"))"
      enabled     = true
      action_parameters {
        phases = ["http_request_firewall_managed"]
      }
    }
  }

  rules {
    action      = "block"
    description = "Block CMS, secret-file, and path-traversal scanner probes"
    expression  = "not starts_with(http.request.uri.path, \"/.well-known/\") and (lower(http.request.uri.path) contains \".php\" or lower(http.request.uri.path) contains \"/wp-\" or lower(http.request.uri.path) contains \"/xmlrpc\" or lower(http.request.uri.path) contains \"/.env\" or lower(http.request.uri.path) contains \"/.git\" or lower(http.request.uri.path) contains \"/phpmyadmin\" or lower(http.request.uri.path) contains \"/cgi-bin/\" or lower(http.request.uri.path) contains \"/actuator\" or lower(http.request.uri.path) contains \"/vendor/\" or lower(http.request.uri.path) contains \"..\")"
    enabled     = true
  }

  rules {
    action      = "block"
    description = "Strict HTTP method & API/Action route allowlist"
    expression  = "(not http.request.method in {\"GET\" \"HEAD\" \"POST\" \"OPTIONS\"}) or (http.request.method eq \"POST\" and not http.request.uri.path in {\"/_actions/booking\" \"/_actions/contact\" \"/_actions/newsletter\"}) or (http.request.uri.path in {\"/_actions/booking\" \"/_actions/contact\" \"/_actions/newsletter\"} and http.request.method ne \"POST\") or (starts_with(http.request.uri.path, \"/api/\") and not http.request.uri.path in {\"/api/destinations.json\" \"/api/excursions.json\" \"/api/tours.json\"}) or (starts_with(http.request.uri.path, \"/_actions/\") and not http.request.uri.path in {\"/_actions/booking\" \"/_actions/contact\" \"/_actions/newsletter\"})"
    enabled     = true
  }

  rules {
    action      = "block"
    description = "Enforce Content-Type & same-origin headers on Astro Actions"
    expression  = "(http.request.uri.path in {\"/_actions/booking\" \"/_actions/contact\"} and not (lower(http.request.headers[\"content-type\"][0]) contains \"multipart/form-data\" or lower(http.request.headers[\"content-type\"][0]) contains \"application/x-www-form-urlencoded\")) or (http.request.uri.path eq \"/_actions/newsletter\" and not lower(http.request.headers[\"content-type\"][0]) contains \"application/json\") or (starts_with(http.request.uri.path, \"/_actions/\") and not http.request.headers[\"origin\"][0] in {\"https://amsirartrip.com\" \"https://www.amsirartrip.com\"})"
    enabled     = true
  }

  rules {
    action      = "block"
    description = "Block scripted CLI clients on Action write endpoints"
    expression  = "starts_with(http.request.uri.path, \"/_actions/\") and (http.user_agent eq \"\" or lower(http.user_agent) contains \"curl/\" or lower(http.user_agent) contains \"python-\" or lower(http.user_agent) contains \"go-http-client\" or lower(http.user_agent) contains \"wget/\" or lower(http.user_agent) contains \"scrapy\" or lower(http.user_agent) contains \"libwww-perl\" or http.request.version eq \"HTTP/1.0\")"
    enabled     = true
  }

  rules {
    action      = "managed_challenge"
    description = "Challenge elevated threat scores on Action endpoints (zero geo-blocking)"
    expression  = "starts_with(http.request.uri.path, \"/_actions/\") and cf.threat_score gt 10 and not cf.client.bot"
    enabled     = true
  }
}

# ─── 4. Managed WAF Rulesets (Pro+ Only — Multilingual Safe) ──────────────────
resource "cloudflare_ruleset" "waf_managed" {
  count   = var.cloudflare_plan == "pro" ? 1 : 0
  zone_id = var.zone_id
  name    = "AmsirarTrip Managed WAF"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    action      = "execute"
    description = "Cloudflare Managed Ruleset (non-JS stacks disabled)"
    expression  = "true"
    enabled     = true
    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e9aee"
      overrides {
        categories {
          category = "wordpress"
          enabled  = false
        }
        categories {
          category = "php"
          enabled  = false
        }
        categories {
          category = "drupal"
          enabled  = false
        }
        categories {
          category = "joomla"
          enabled  = false
        }
        categories {
          category = "magento"
          enabled  = false
        }
      }
    }
  }

  rules {
    action      = "execute"
    description = "OWASP Core Ruleset PL1 only (safe for EN/FR/DE/ES booking forms)"
    expression  = "true"
    enabled     = true
    action_parameters {
      id = "4814384a9e5d4991b9815dcfc25d2f1f"
      overrides {
        categories {
          category = "paranoia-level-2"
          enabled  = false
        }
        categories {
          category = "paranoia-level-3"
          enabled  = false
        }
        categories {
          category = "paranoia-level-4"
          enabled  = false
        }
        rules {
          id              = "6179ae15870a4bb7b2d480d4843b323c"
          score_threshold = 40
          action          = var.owasp_action
        }
      }
    }
  }
}

# ─── 5. Edge Rate Limiting ────────────────────────────────────────────────────
resource "cloudflare_ruleset" "rate_limiting_free" {
  count   = var.cloudflare_plan == "free" ? 1 : 0
  zone_id = var.zone_id
  name    = "AmsirarTrip Edge Rate Limit (Free)"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules {
    action      = "block"
    description = "Throttle POST requests to Astro Actions"
    expression  = "http.request.method eq \"POST\" and starts_with(http.request.uri.path, \"/_actions/\")"
    enabled     = true
    ratelimit {
      characteristics     = ["ip.src"]
      period              = 10
      requests_per_period = 8
      mitigation_timeout  = 10
    }
  }
}

resource "cloudflare_ruleset" "rate_limiting_pro" {
  count   = var.cloudflare_plan == "pro" ? 1 : 0
  zone_id = var.zone_id
  name    = "AmsirarTrip Edge Rate Limits (Pro+)"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules {
    action      = "managed_challenge"
    description = "RL: Booking & Contact form POSTs (NAT-safe 3-tuple)"
    expression  = "http.request.method eq \"POST\" and http.request.uri.path in {\"/_actions/booking\" \"/_actions/contact\"}"
    enabled     = true
    ratelimit {
      characteristics     = ["cf.colo.id", "ip.src", "http.request.headers[\"user-agent\"][0]"]
      period              = 60
      requests_per_period = 10
      mitigation_timeout  = 600
    }
  }

  rules {
    action      = "block"
    description = "RL: Newsletter form POSTs"
    expression  = "http.request.method eq \"POST\" and http.request.uri.path eq \"/_actions/newsletter\""
    enabled     = true
    ratelimit {
      characteristics     = ["cf.colo.id", "ip.src", "http.request.headers[\"user-agent\"][0]"]
      period              = 60
      requests_per_period = 5
      mitigation_timeout  = 600
    }
  }

  rules {
    action      = "block"
    description = "RL: Public catalog JSON endpoints"
    expression  = "http.request.method eq \"GET\" and http.request.uri.path in {\"/api/destinations.json\" \"/api/excursions.json\" \"/api/tours.json\"}"
    enabled     = true
    ratelimit {
      characteristics     = ["cf.colo.id", "ip.src"]
      period              = 60
      requests_per_period = 60
      mitigation_timeout  = 120
    }
  }
}

# ─── 6. Cache Rules (Safe with Astro 7 Hash-Based CSP) ────────────────────────
resource "cloudflare_ruleset" "cache_rules" {
  zone_id = var.zone_id
  name    = "AmsirarTrip Cache Rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    action      = "set_cache_settings"
    description = "Never cache Astro Actions"
    expression  = "starts_with(http.request.uri.path, \"/_actions/\")"
    enabled     = true
    action_parameters {
      cache = false
    }
  }

  rules {
    action      = "set_cache_settings"
    description = "Cache static assets (ignore query strings to prevent cache-bust DoS)"
    expression  = "http.request.method in {\"GET\" \"HEAD\"} and (starts_with(http.request.uri.path, \"/_astro/\") or starts_with(http.request.uri.path, \"/images/\") or starts_with(http.request.uri.path, \"/videos/\") or starts_with(http.request.uri.path, \"/fonts/\") or starts_with(http.request.uri.path, \"/icons/\") or starts_with(http.request.uri.path, \"/patterns/\"))"
    enabled     = true
    action_parameters {
      cache = true
      cache_key {
        ignore_query_strings_order = true
      }
      edge_ttl {
        mode = "respect_origin"
      }
      browser_ttl {
        mode = "respect_origin"
      }
    }
  }

  rules {
    action      = "set_cache_settings"
    description = "Cache public JSON catalog and discovery endpoints"
    expression  = "http.request.method in {\"GET\" \"HEAD\"} and http.request.uri.path in {\"/api/destinations.json\" \"/api/excursions.json\" \"/api/tours.json\" \"/robots.txt\" \"/sitemap.xml\" \"/sitemap-index.xml\" \"/llms.txt\" \"/llms-full.txt\" \"/.well-known/ai-catalog.json\" \"/.well-known/security.txt\"}"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode = "respect_origin"
      }
    }
  }

  rules {
    action      = "set_cache_settings"
    description = "Cache public HTML pages (safe under Astro 7 build-time SHA-256 hash CSP)"
    expression  = "http.request.method in {\"GET\" \"HEAD\"} and not starts_with(http.request.uri.path, \"/_actions/\") and not starts_with(http.request.uri.path, \"/api/\")"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode = "respect_origin"
      }
    }
  }
}

# ─── 7. Baseline Edge Security Headers (No Duplicate CSP) ─────────────────────
resource "cloudflare_ruleset" "response_security_headers" {
  zone_id = var.zone_id
  name    = "AmsirarTrip Edge Response Headers"
  kind    = "zone"
  phase   = "http_response_headers_transform"

  rules {
    action      = "rewrite"
    description = "Enforce baseline headers across static/cached/error responses and strip leaky headers"
    expression  = "true"
    enabled     = true
    action_parameters {
      headers {
        name      = "X-Content-Type-Options"
        operation = "set"
        value     = "nosniff"
      }
      headers {
        name      = "Referrer-Policy"
        operation = "set"
        value     = "strict-origin-when-cross-origin"
      }
      headers {
        name      = "X-Permitted-Cross-Domain-Policies"
        operation = "set"
        value     = "none"
      }
      headers {
        name      = "Strict-Transport-Security"
        operation = "set"
        value     = "max-age=63072000; includeSubDomains; preload"
      }
      headers {
        name      = "X-Powered-By"
        operation = "remove"
      }
      headers {
        name      = "Via"
        operation = "remove"
      }
    }
  }
}
