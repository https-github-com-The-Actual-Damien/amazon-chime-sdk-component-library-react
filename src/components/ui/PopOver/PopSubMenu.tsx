// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  FC,
  createRef,
  useState,
  HTMLAttributes,
  useEffect,
} from 'react';
import { Manager, Reference, Popper } from 'react-popper';
import classnames from 'classnames';

import { KEY_CODES } from '../../../constants';
import useClickOutside from '../../../hooks/useClickOutside';
import useTabOutside from '../../../hooks/useTabOutside';
import { BaseProps } from '../Base';
import { StyledPopOverMenu, StyledPopOverToggle } from './Styled';

export type Placement =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end';

export interface PopOverProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'css'>,
    BaseProps {
  /** CSS classname to apply custom styles. */
  className?: string;
  /** Whether or not this is a sub menu. */
  isSubMenu?: Boolean;
  /** Defines the placement of PopOver menu. */
  placement?: Placement;
  /** Defines the function to render the inner contents of the popover button element */
  renderButton?: (isActive: boolean) => {};
  /** Alternative to renderButton, defines the function to render the full popover button element (as opposed to just its contents). This is used if you want full control over the button rendering. The button must forwardRef */
  renderButtonWrapper?: (isActive: boolean, props: any) => {};
  /** The label used for availability. */
  a11yLabel: string;
  /** The elements that populate the menu */
  children: any;
}

const getFocusableElements = (node: HTMLElement): NodeListOf<HTMLElement> => {
  return node.querySelectorAll('button, [href]');
};

export const PopSubMenu: FC<PopOverProps> = ({
  renderButton,
  renderButtonWrapper,
  children,
  isSubMenu = false,
  placement = 'bottom-start',
  a11yLabel,
  className,
  ...rest
}) => {
  const subMenuRef = createRef<HTMLSpanElement>();
  const [isOpen, setIsOpen] = useState(false);
  const [isListActive, setClass] = useState(false);

  useEffect(() => {
    if (isOpen && !!subMenuRef.current) {
      const nodes = getFocusableElements(subMenuRef.current);
      !!nodes && nodes[0].focus();
    }
  }, [isOpen]);

  const move = (direction: string) => {
    const node = subMenuRef.current;

    if (isSubMenu) {
      // the parent menu can access
      // child nodes and manage focused elements
      return;
    }
    if (!!node) {
      const nodes = getFocusableElements(node);
      const currentElement = document.activeElement;

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === currentElement) {
          if (direction === 'down' && i !== nodes.length - 1) {
            return nodes[i + 1].focus();
          }

          if (direction === 'up' && i > 0) {
            return nodes[i - 1].focus();
          }
          break;
        }
      }
    }
  };

  const closePopover = (e: any) => {
    const isSubMenuButton = e.target.closest("[data-menu='submenu']");
    return !isSubMenuButton ? setIsOpen(false) : false;
  };

  const handleKeyUp = (e: any) => {
    switch (e.keyCode) {
      case KEY_CODES.ESCAPE:
        return setIsOpen(false);
      case KEY_CODES.ARROW_UP:
        return move('up');
      case KEY_CODES.ARROW_DOWN:
        return move('down');
    }
  };

  useClickOutside(subMenuRef, () => setIsOpen(false));
  useTabOutside(subMenuRef, () => setIsOpen(false));
  console.log("222222222222222")

  return (
    <span
      ref={subMenuRef}
      onKeyDown={handleKeyUp}
      data-testid="popover"
      onMouseLeave={() => {
        setIsOpen(false);
        setClass(false);
      }}
      onMouseOver={() => setClass(true)}
      className={classnames(
        { hovered: isListActive },
        { 'not-hovered': !isListActive }
      )}
    >
      <Manager>
        <Reference>
          {({ ref }) => {
            let props = {
              ref,
              className: classnames(className, 'ch-popover-toggle'),
              onMouseOver: () => setIsOpen(true),
              'data-menu': isSubMenu ? 'submenu' : null,
              'aria-label': a11yLabel,
              'aria-haspopup': true,
              'aria-expanded': isOpen,
              'data-testid': 'popover-toggle',
            };

            if (renderButton) {
              return (
                <StyledPopOverToggle {...props}>
                  {renderButton(isOpen)}
                </StyledPopOverToggle>
              );
            }

            if (renderButtonWrapper) {
              return renderButtonWrapper(isOpen, props);
            }

            return null;
          }}
        </Reference>
        {isOpen && (
          <Popper
            placement={placement}
            modifiers={[{ name: 'offset', options: { offset: [-8, 0] } }]}
            {...rest}
          >
            {({ ref, style, placement }) => (
              <StyledPopOverMenu
                data-placement={placement}
                onClick={(e: any) => closePopover(e)}
                ref={ref}
                style={style}
                data-testid="menu"
                className={classnames('ch-popover-menu', {
                  'submenu-poperOpen': isSubMenu,
                })}
                data-menu="submenu-poperOpen"
              >
                {children}
              </StyledPopOverMenu>
            )}
          </Popper>
        )}
      </Manager>
    </span>
  );
};

export default PopSubMenu;
