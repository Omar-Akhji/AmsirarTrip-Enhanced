export type WaypointType = "start" | "waypoint" | "highlight" | "end";

export interface RouteWaypoint {
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly dayOrTime?: string | undefined;
  readonly description?: string | undefined;
  readonly type?: WaypointType | undefined;
}

export interface RouteMapData {
  readonly id: string;
  readonly title: string;
  readonly startCity: string;
  readonly endCity: string;
  readonly distance?: string | undefined;
  readonly duration?: string | undefined;
  readonly waypoints: readonly RouteWaypoint[];
  readonly routeCoordinates: readonly [number, number][];
  readonly googleMapsEmbedUrl: string;
  readonly googleMapsAppUrl: string;
}
