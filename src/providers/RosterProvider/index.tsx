// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useEffect,
  useRef,
  useMemo,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { DefaultModality } from 'amazon-chime-sdk-js';
import { initialState, reducer, VideoTileActionType } from './state';
import { useMeetingManager } from '../MeetingProvider';
import { useAudioVideo } from '../AudioVideoProvider';
import { RosterType, RosterAttendeeType } from '../../types';

interface RosterContextValue {
  roster: RosterType;
  pinTile: (chimeAttendeeId: string) => void;
  unPinTile: (chimeAttendeeId: string) => void;
}

const RosterContext = React.createContext<RosterContextValue | null>(null);

const RosterProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const rosterRef = useRef<RosterType>({});
  const cardIndexRef = useRef<number>(0);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const rosterUpdateCallback = async (
      chimeAttendeeId: string,
      present: boolean,
      externalUserId?: string
    ): Promise<void> => {
      if (!present) {
        delete rosterRef.current[chimeAttendeeId];
        audioVideo.realtimeUnsubscribeFromVolumeIndicator(chimeAttendeeId);
        dispatch({
          type: VideoTileActionType.REMOVE,
          payload: {
            chimeAttendeeId,
          },
        });

        return;
      }

      const attendeeId = new DefaultModality(chimeAttendeeId).base();
      if (attendeeId !== chimeAttendeeId) {
        return;
      }

      const inRoster = rosterRef.current[chimeAttendeeId];
      if (inRoster) {
        return;
      }

      let attendee: RosterAttendeeType = {
        chimeAttendeeId,
        order: 0,
        cardIndex: ++cardIndexRef.current,
        isPinned: false,
      };

      if (externalUserId) {
        attendee.externalUserId = externalUserId;
      }

      rosterRef.current[attendeeId] = attendee;

      // Update the roster first before waiting to fetch attendee info

      if (meetingManager.getAttendee) {
        const externalData = await meetingManager.getAttendee(externalUserId);

        attendee = { ...attendee, ...externalData };
      }

      rosterRef.current[attendeeId] = attendee;
      dispatch({
        type: VideoTileActionType.UPDATE,
        payload: {
          attendee,
          chimeAttendeeId,
        },
      });
    };

    audioVideo.realtimeSubscribeToAttendeeIdPresence(rosterUpdateCallback);

    return () => {
      rosterRef.current = {};
      dispatch({ type: VideoTileActionType.RESET });
      audioVideo.realtimeUnsubscribeToAttendeeIdPresence(rosterUpdateCallback);
    };
  }, [audioVideo]);

  const pinTile = useCallback((chimeAttendeeId: string): void => {
    if (!chimeAttendeeId) {
      return;
    }
    const attendee = rosterRef.current[chimeAttendeeId];
    dispatch({
      type: VideoTileActionType.PIN,
      payload: {
        attendee,
        chimeAttendeeId,
        isPinned: true,
      },
    });
  }, []);

  const unPinTile = useCallback((chimeAttendeeId: string): void => {
    if (!chimeAttendeeId) {
      return;
    }
    const attendee = rosterRef.current[chimeAttendeeId];
    dispatch({
      type: VideoTileActionType.PIN,
      payload: {
        attendee,
        chimeAttendeeId,
        isPinned: false,
      },
    });
  }, []);

  const value = useMemo(
    () => ({
      roster: state.roaster,
      pinTile,
      unPinTile,
    }),
    [state.roaster, pinTile, unPinTile]
  );

  return (
    <RosterContext.Provider value={value}>{children}</RosterContext.Provider>
  );
};

function useRosterState(): RosterContextValue {
  const state = useContext(RosterContext);

  if (!state) {
    throw new Error('userRosterState must be used within RosterProvider');
  }

  return state;
}

export { RosterProvider, useRosterState };
