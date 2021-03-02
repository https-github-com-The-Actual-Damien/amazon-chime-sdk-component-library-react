// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { DefaultModality } from 'amazon-chime-sdk-js';

import { useMeetingManager } from '../MeetingProvider';
import { useAudioVideo } from '../AudioVideoProvider';
import { RosterType, RosterAttendeeType } from '../../types';

interface RosterContextValue {
  roster: RosterType;
}

const RosterContext = React.createContext<RosterContextValue | null>(null);

const RosterProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const rosterRef = useRef<RosterType>({});
  const [roster, setRoster] = useState<RosterType>({});

  meetingManager.getAttendee;

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
        setRoster((currentRoster: RosterType) => {
          const { [chimeAttendeeId]: _, ...rest } = currentRoster;
          return { ...rest };
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

      let attendee: RosterAttendeeType = { chimeAttendeeId };

      if (externalUserId) {
        attendee.externalUserId = externalUserId;
      }

      if (meetingManager.getAttendee) {
        const externalData = await meetingManager.getAttendee(externalUserId);

        attendee = { ...attendee, ...externalData };
      }

      rosterRef.current[attendeeId] = attendee;

      if (attendee && attendee.role && attendee.role === 'presenter') {
        setRoster((oldRoster) => ({
          [attendeeId]: attendee,
          ...oldRoster,
        }));
      } else {
        setRoster((oldRoster) => ({
          ...oldRoster,
          [attendeeId]: attendee,
        }));
      }
    };

    audioVideo.realtimeSubscribeToAttendeeIdPresence(rosterUpdateCallback);

    return () => {
      setRoster({});
      rosterRef.current = {};
      audioVideo.realtimeUnsubscribeToAttendeeIdPresence(rosterUpdateCallback);
    };
  }, [audioVideo]);

  const value = useMemo(
    () => ({
      roster,
    }),
    [roster]
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
