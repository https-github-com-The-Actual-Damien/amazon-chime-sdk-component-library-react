// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, HTMLAttributes } from 'react';

import IconButton from '../Button/IconButton';
// import Remove from '../icons/Remove';
import { useModalContext } from './ModalContext';
import { StyledModalHeader } from './Styled';
import { BaseProps } from '../Base';

export interface ModalHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
    BaseProps {
  /** The title of the header in the modal. */
  title: string;
  /** Whether or not the close icon is shown on the modal. */
  displayClose?: boolean;
}

export const ModalHeader: FC<ModalHeaderProps> = ({
  tag: Tag = 'div',
  displayClose = true,
  title,
  ...rest
}) => {
  const context = useModalContext();
  const handleClick = () => {
    return context && context.onClose();
  };

  return (
    <StyledModalHeader {...rest}>
      <Tag className="ch-title" id={context.labelID}>
        {title}
      </Tag>

      {displayClose && context?.dismissible && (
        <IconButton
          label="Close"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
            >
              <g fill="none" fill-rule="evenodd">
                <g fill="#283747">
                  <g>
                    <g>
                      <path
                        d="M.34.34c.39-.39.96-.454 1.273-.142l4.383 4.384L10.381.198c.312-.312.882-.249 1.273.142.39.39.453.96.141 1.273L7.411 5.996l4.384 4.385c.288.288.257.796-.057 1.18l-.084.093c-.39.39-.96.453-1.273.141L5.996 7.411l-4.383 4.384c-.313.312-.883.25-1.273-.141-.39-.39-.454-.96-.142-1.273l4.384-4.385L.198 1.613C-.09 1.324-.058.817.256.433z"
                        transform="translate(-942 -121) translate(450 97) translate(492 24)"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          }
          className="ch-close-button"
          onClick={handleClick}
        />
      )}
    </StyledModalHeader>
  );
};

export default ModalHeader;
