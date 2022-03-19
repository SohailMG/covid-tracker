import React from "react";
import Skeleton from "react-loading-skeleton";
export function SkeletonView({}) {
  return (
    <div className="flex items-end space-x-2">
      <Skeleton
        baseColor="#374151"
        highlightColor="#202A37"
        width={200}
        height={200}
      />
      <Skeleton
        baseColor="#374151"
        highlightColor="#202A37"
        width={460}
        height={300}
      />
      <Skeleton
        baseColor="#374151"
        highlightColor="#202A37"
        width={200}
        height={200}
      />
    </div>
  );
}
