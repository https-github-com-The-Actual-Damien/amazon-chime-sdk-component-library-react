// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { RosterAttendeeType, RosterType } from '../../types';

export type State = {
  roaster: RosterType;
};

export enum VideoTileActionType {
  UPDATE,
  REMOVE,
  RESET,
  PIN,
  UNPIN,
}

type UpdateAction = {
  type: VideoTileActionType.UPDATE;
  payload: {
    attendee?: RosterAttendeeType;
    chimeAttendeeId: string;
  };
};

type RemoveAction = {
  type: VideoTileActionType.REMOVE;
  payload: {
    attendee?: RosterAttendeeType;
    chimeAttendeeId: string;
  };
};

type PinAction = {
  type: VideoTileActionType.PIN;
  payload: {
    attendee?: RosterAttendeeType;
    chimeAttendeeId: string;
    isPinned?: boolean;
  };
};

type ResetAction = {
  type: VideoTileActionType.RESET;
  payload?: any;
};

export type Action = UpdateAction | RemoveAction | ResetAction | PinAction;

export const initialState: State = {
  roaster: {},
};

const removeProperty = (obj: { [key: string]: any }, property: string) => {
  const newState = Object.assign({}, obj);
  delete newState[property];
  return newState;
};

export function reducer(state: State, { type, payload }: Action): State {
  const { roaster } = state;

  switch (type) {
    case VideoTileActionType.UPDATE: {
      const { attendee, chimeAttendeeId } = payload;

      if (!attendee || !chimeAttendeeId) {
        return state;
      }
      let stateRoaster = {
        ...roaster,
        [chimeAttendeeId]: {
          ...attendee,
          order:
            attendee && attendee?.role.toLowerCase() === 'presenter' ? 1 : 2,
        },
      };

      return {
        roaster: stateRoaster,
      };
    }
    case VideoTileActionType.REMOVE: {
      const { chimeAttendeeId } = payload;

      const attendees = removeProperty(roaster, chimeAttendeeId);

      return {
        roaster: attendees,
      };
    }
    case VideoTileActionType.PIN: {
      const { attendee, chimeAttendeeId, isPinned } = payload;

      if (!attendee || !chimeAttendeeId) {
        return state;
      }

      let stateRoaster = {
        ...roaster,
        [chimeAttendeeId]: { ...attendee, isPinned: isPinned },
      };

      let attendees = Object.values(stateRoaster);
      const attendeesIds = Object.keys(stateRoaster);
      const pinnedAttendees = attendees
        .filter((_attendee: RosterAttendeeType) => _attendee?.isPinned)
        .map((_attendee: RosterAttendeeType) => _attendee.chimeAttendeeId);
      attendees = attendees.map((_attendee: RosterAttendeeType) => {
        if (_attendee.role && _attendee.role.toLowerCase() === 'presenter') {
          if (pinnedAttendees.includes(_attendee.chimeAttendeeId)) {
            _attendee.order = 1;
          } else {
            _attendee.order = 2;
          }
        } else {
          if (pinnedAttendees.includes(_attendee.chimeAttendeeId)) {
            _attendee.order = 3;
          } else {
            _attendee.order = 4;
          }
        }
        return _attendee;
      });

      attendeesIds.forEach((attendeeId: string, index) => {
        if (stateRoaster[attendeeId]) {
          stateRoaster[attendeeId] = attendees[index];
        }
      });

      return {
        roaster: stateRoaster,
      };
    }

    case VideoTileActionType.RESET: {
      return initialState;
    }

    default:
      throw new Error('Incorrect type in VideoProvider');
  }
}
