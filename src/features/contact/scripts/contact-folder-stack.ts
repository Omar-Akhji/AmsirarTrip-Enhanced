import { registerFolderStackElement } from "@/scripts/folder-stack-controller";

registerFolderStackElement("contact-folder-stack", {
  trackSelector: ".contact-folder-track",
  stageSelector: ".contact-folder-stage",
  cardCardSelector: ".contact-info-card",
  card1TargetY: 36,
  card2TargetY: 52,
});
