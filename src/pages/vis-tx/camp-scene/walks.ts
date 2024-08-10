import { IVector2 } from "~/common/math";

import { Placement } from "~/common/Placement";
import { walkLane, waitingZone } from "./regions";

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

export function createWalkPoints(source: WalkHead, dest: WalkHead): IVector2[] {
  let pa = source.placement?.type ?? null;
  let pb = dest.placement!.type;

  let wa = source.position;
  let wb = dest.position;

  let points: IVector2[] = [];

  if (pa === null) {
    // dest could be either waiting zone or a plane
    // in both case the shape of the path is the same

    // L path from source to walk lane
    points.push(
      ...edgePathX(wa, {
        x: walkLane.rect.centerX,
        y: wb.y
      })
    );

    // Walk lane to dest (waiting or block)
    points.push(wb);
  } else if (pa === "waiting" && pb === "block") {
    points.push(...edgePathY(wa, wb));
  } else if (pa === "block" && pb === "waiting") {
    points.push(...edgePathX(wa, wb));
  } else if (pa === "block" && pb === "block") {
    // First move out to waiting at dest Y
    let waitingX = waitingZone.rect.right - 50;
    points.push(...edgePathX(wa, { x: waitingX, y: wb.y }));

    // Then move to dest
    points.push(wb);
  }

  return points;
}
