// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { DefaultModality } from 'amazon-chime-sdk-js';

import { useMeetingManager } from '../MeetingProvider';
import { useAudioVideo } from '../AudioVideoProvider';
import { RosterType, RosterAttendeeType } from '../../types';

interface RosterContextValue {
  roster: RosterType;
  togglePinned: (attendeeId: string) => void;
}

const RosterContext = React.createContext<RosterContextValue | null>(null);
const pinnedAttendees: string[] = [];
let cardIndex: number = 0;
const RosterProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const rosterRef = useRef<RosterType>({});
  const [roster, setRoster] = useState<RosterType>({});

  meetingManager.getAttendee;

  const togglePinned = (attendeeId: string) => {
      const pinnedattendee = [...pinnedAttendees];
      const foundIndex = pinnedattendee.findIndex(
          (chimeId: string) => chimeId === attendeeId
      );
      if (foundIndex !== -1) {
          pinnedAttendees.splice(foundIndex, 1);
      } else {
          pinnedAttendees.push(attendeeId);
      }
      roosterPrecendence();
  };

  const roosterPrecendence = () => {
      setRoster((oldRoster) => {
          const roosterAttendee = Object.values(oldRoster);
          const presenters = roosterAttendee.filter((x: RosterAttendeeType) => x.role && x.role.toLowerCase() === 'presenter' &&
              !pinnedAttendees.includes(x.chimeAttendeeId))
              .sort((a: RosterAttendeeType, b: RosterAttendeeType) => (a.cardIndex > b.cardIndex ? 1 : -1));
          const pinnedPresenters = roosterAttendee.filter((x: RosterAttendeeType) => x.role && x.role.toLowerCase() === 'presenter' &&
              pinnedAttendees.includes(x.chimeAttendeeId))
              .sort((a: RosterAttendeeType, b: RosterAttendeeType) => (a.cardIndex > b.cardIndex ? 1 : -1));
          const pinnedAttendee = roosterAttendee
              .filter(
                  (x: RosterAttendeeType) =>
                      x.role !== undefined && x.role.toLowerCase() !== 'presenter' &&
                      pinnedAttendees.includes(x.chimeAttendeeId)
              )
              .sort((a: RosterAttendeeType, b: RosterAttendeeType) => (a.cardIndex > b.cardIndex ? 1 : -1));
          const regularAttendees = roosterAttendee
              .filter(
                  (x: RosterAttendeeType) =>
                      x.role !== undefined && x.role.toLowerCase() !== 'presenter' &&
                      !pinnedAttendees.includes(x.chimeAttendeeId)
              )
              .sort((a: RosterAttendeeType, b: RosterAttendeeType) => (a.cardIndex > b.cardIndex ? 1 : -1));
          const allattendees = [...pinnedPresenters.concat(presenters).concat(pinnedAttendee).concat(regularAttendees)];
          const attendees = allattendees.map((attendee: RosterAttendeeType, index: number) => {
              attendee.order = index;
              attendee.isPinned = pinnedAttendees.includes(attendee.chimeAttendeeId);
              return attendee;
          });
          const modifiedRoster: RosterType = {};
          attendees.forEach((attendee: RosterAttendeeType) => {
              modifiedRoster[attendee.chimeAttendeeId] = attendee;
          });
          return modifiedRoster;
      });
  };

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

      let attendee: RosterAttendeeType = { chimeAttendeeId, order: 0, cardIndex: ++cardIndex, isPinned: false };

      if (externalUserId) {
        attendee.externalUserId = externalUserId;
      }

      if (meetingManager.getAttendee) {
        const externalData = await meetingManager.getAttendee(externalUserId);

        attendee = { ...attendee, ...externalData };
      }

      rosterRef.current[attendeeId] = attendee;
      setRoster((oldRoster) => ({
          [attendeeId]: attendee,
          ...oldRoster,
      }));
      roosterPrecendence();
      /*if (attendee && attendee.role && attendee.role === 'presenter') {
        setRoster((oldRoster) => ({
          [attendeeId]: attendee,
          ...oldRoster,
        }));
      } else {
        setRoster((oldRoster) => ({
          ...oldRoster,
          [attendeeId]: attendee,
        }));
      }*/
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
      roster, togglePinned
    }),
    [roster, togglePinned]
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
