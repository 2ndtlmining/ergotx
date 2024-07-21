import { IVector2 } from "~/common/math";
import { Placement } from "~/engine/Placement";
import { WorldManager } from "./WorldManager";

function edgePathX(source: IVector2, dest: IVector2): IVector2[] {
  return [
    { x: dest.x, y: source.y },
    { x: dest.x, y: dest.y }
  ];
}

function edgePathY(source: IVector2, dest: IVector2): IVector2[] {
  return [
    { x: source.x, y: dest.y },
    { x: dest.x, y: dest.y }
  ];
}

type WalkHead = {
  placement: Placement | null;
  position: IVector2;
};

export function createWalkPoints(
  source: WalkHead,
  destination: WalkHead
): IVector2[] {
  let pa = source.placement?.type ?? null;
  let pb = destination.placement!.type;

  let wa = source.position;
  let wb = destination.position;

  let points: IVector2[] = [];

  if (pa === null) {
    // Destination could be either waiting zone or a bus
    // in both case the shape of the path is the same

    // L path from source to walk lane
    points.push(
      ...edgePathX(wa, {
        x: WorldManager.WalkLane.rect.centerX,
        y: wb.y
      })
    );

    // Walk lane to destination (waiting or block)
    points.push(wb);
  } else if (pa === "waiting" && pb === "block") {
    points.push(...edgePathY(wa, wb));
  } else if (pa === "block" && pb === "waiting") {
    points.push(...edgePathX(wa, wb));
  } else if (pa === "block" && pb === "block") {
    // First move out to waiting at destination Y
    let waitingX = WorldManager.WaitingZone.rect.right - 50;
    points.push(...edgePathX(wa, { x: waitingX, y: wb.y }));

    // Then move to destination
    points.push(wb);
  }

  return points;
}
