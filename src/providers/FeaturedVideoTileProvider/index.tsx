// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useEffect,
  createContext,
  useState,
  useContext,
  useRef,
  useMemo,
} from 'react';

import { useMeetingManager } from '../MeetingProvider';

interface FeaturedTileState {
  tileId: number | null;
  attendeeId: string | null;
}

const TILE_TRANSITION_DELAY = 1500;

const FeaturedTileContext = createContext<FeaturedTileState | null>(null);

const FeaturedVideoTileProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const activeTileRef = useRef<number | null>(null);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAttendee = useRef<string | null>(null);

  useEffect(() => {
    const activeSpeakerCallback = (activeAttendees: string[]) => {
      const activeId = activeAttendees[0];

      if (activeId === pendingAttendee.current) {
        return;
      }

      // pendingAttendee.current = activeId;

      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      if (!activeId) {
        activeTileRef.current = null;
        pendingAttendee.current = null;
        setActiveTile(null);
        setAttendeeId(null);
        return;
      }

      if (!pendingAttendee.current) {
        pendingAttendee.current = activeId;
        setAttendeeId(activeId);
      } else {
        timeout.current = setTimeout(() => {
          pendingAttendee.current = activeId;
          setAttendeeId(activeId);
        }, TILE_TRANSITION_DELAY);
      }

      // Set featured tile immediately if there is no current featured tile.
      // Otherwise, delay it to avoid tiles jumping around too frequently
    };

    meetingManager.subscribeToActiveSpeaker(activeSpeakerCallback);

    return () =>
      meetingManager.unsubscribeFromActiveSpeaker(activeSpeakerCallback);
  }, []);

  const value = useMemo(
    () => ({
      tileId: activeTile,
      attendeeId: attendeeId,
    }),
    [activeTile, attendeeId]
  );

  return (
    <FeaturedTileContext.Provider value={value}>
      {children}
    </FeaturedTileContext.Provider>
  );
};

function useFeaturedTileState(): FeaturedTileState {
  const state = useContext(FeaturedTileContext);

  if (!state) {
    throw new Error(
      'useFeaturedTileState must be used within an FeaturedVideoTileProvider'
    );
  }

  return state;
}

export { FeaturedVideoTileProvider, useFeaturedTileState };
