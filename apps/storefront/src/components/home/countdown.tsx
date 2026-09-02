"use client";

import {
  useEffect,
  useState,
} from "react";


interface CountdownProps {
  seconds: number;
}


function formatTime(
  totalSeconds: number,
) {
  const safe = Math.max(
    0,
    totalSeconds,
  );

  const days = Math.floor(
    safe / 86400,
  );

  const hours = Math.floor(
    (safe % 86400) / 3600,
  );

  const minutes = Math.floor(
    (safe % 3600) / 60,
  );

  const seconds = safe % 60;

  const clock = [
    hours
      .toString()
      .padStart(
        2,
        "0",
      ),

    minutes
      .toString()
      .padStart(
        2,
        "0",
      ),

    seconds
      .toString()
      .padStart(
        2,
        "0",
      ),
  ].join(":");

  if (days > 0) {
    return `${days}j ${clock}`;
  }

  return clock;
}


export function Countdown({
  seconds,
}: CountdownProps) {
  const [
    targetTimestamp,
  ] = useState(
    () =>
      Date.now()
      + Math.max(
        0,
        seconds,
      ) * 1000,
  );

  const [
    currentTimestamp,
    setCurrentTimestamp,
  ] = useState(
    () => Date.now(),
  );

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          const now =
            Date.now();

          setCurrentTimestamp(
            now,
          );

          if (
            now >=
            targetTimestamp
          ) {
            window.clearInterval(
              timer,
            );
          }
        },
        1000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    seconds,
    targetTimestamp,
  ]);

  const remaining =
    Math.max(
      0,
      Math.ceil(
        (
          targetTimestamp
          - currentTimestamp
        )
        / 1000,
      ),
    );

  return (
    <span>
      {formatTime(
        remaining,
      )}
    </span>
  );
}