import { registerFolderStackElement } from "@/scripts/folder-stack-controller";

registerFolderStackElement("stat-highlights-stack", {
  trackSelector: ".stat-highlights-track",
  stageSelector: ".stat-highlights-stage",
  cardCardSelector: ".stat-card",
  card1TargetY: 40,
  card2TargetY: 56,
});
