import { registerFolderStackElement } from "@/shared/scripts/folder-stack-controller";

registerFolderStackElement("stats-folder-stack", {
  trackSelector: ".stats-folder-track",
  stageSelector: ".stats-folder-stage",
  cardCardSelector: ".stat-card",
  card1TargetY: 40,
  card2TargetY: 56,
});
