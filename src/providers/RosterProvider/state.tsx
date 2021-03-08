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

// type ResetAction = {
//   type: VideoTileActionType.RESET;
//   payload?: any;
// };

export type Action = UpdateAction | RemoveAction;

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


      const attendees = {
        ...roaster,
        [chimeAttendeeId]: attendee,
      };

      return {
        roaster: attendees,
      };
    }
    case VideoTileActionType.REMOVE: {
      const { chimeAttendeeId } = payload;
      console.log(chimeAttendeeId, 'removed');
      const attendees = removeProperty(roaster, chimeAttendeeId);

      return {
        roaster: attendees,
      };
    }

    default:
      throw new Error('Incorrect type in VideoProvider');
  }
}
