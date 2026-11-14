export type WaypointType = "start" | "waypoint" | "highlight" | "end";

export interface RouteWaypoint {
  readonly dayOrTime?: string | undefined;
  readonly description?: string | undefined;
  readonly lat: number;
  readonly lng: number;
  readonly name: string;
  readonly type?: WaypointType | undefined;
}

export interface RouteMapData {
  readonly distance?: string | undefined;
  readonly duration?: string | undefined;
  readonly endCity: string;
  readonly googleMapsAppUrl: string;
  readonly googleMapsEmbedUrl: string;
  readonly id: string;
  readonly routeCoordinates: readonly [number, number][];
  readonly startCity: string;
  readonly title: string;
  readonly waypoints: readonly RouteWaypoint[];
}
