// Extra hand-written roadmaps, one file per role. Files here import only *types* from ../roadmaps-data
// (never values) so there is no circular import at load time. Shared helpers live in ./_kit.ts.
import type { RoadmapData } from "../roadmaps-data.ts";
import backendDeveloper from "./backend-developer.ts";
import fullStackDeveloper from "./full-stack-developer.ts";
import productManager from "./product-manager.ts";
import socialMediaManager from "./social-media-manager.ts";
import operationsAnalyst from "./operations-analyst.ts";
import salesExecutive from "./sales-executive.ts";
import hrExecutive from "./hr-executive.ts";
import graphicDesigner from "./graphic-designer.ts";

export const EXTRA_ROADMAPS: RoadmapData[] = [
  backendDeveloper,
  fullStackDeveloper,
  productManager,
  socialMediaManager,
  operationsAnalyst,
  salesExecutive,
  hrExecutive,
  graphicDesigner,
];
