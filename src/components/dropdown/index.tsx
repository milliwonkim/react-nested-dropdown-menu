import clsx from "clsx";
import React, {
  ReactElement,
  ReactNode,
  UIEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getMenuPositionClassName } from "./utils";
import { useClickAway } from "../../hooks/use-click-away";
import { Grid, SxProps, Theme } from "@mui/material";

export interface DropdownItem<TValue = undefined> {
  label: string;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  items?: DropdownItem<TValue>[];
  itemsContainerWidth?: number | string;
  value?: TValue;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownProps<TValue> {
  items: DropdownItem<TValue>[];
  containerWidth?: number | string;
  onSelect?: (value: TValue, option: DropdownItem<TValue>) => void;
  children: (params: { onClick: () => void; isOpen: boolean }) => ReactElement;
  className?: string;
  renderOption?: (option: DropdownItem<TValue>) => ReactNode;
  closeOnScroll?: boolean;
}

const rootMenuStyle: SxProps<Theme> = {
  position: "absolute",
  top: "100%",
  right: 0,
  margin: "7px 0",
  zIndex: 10,
};

const menuStyle: SxProps<Theme> = {
  background: "#fff",
  border: "1px solid gray",
  boxShadow: "0 4px 17px rgba(0, 0, 0, 0.05)",
  borderRadius: "4px",
  padding: "4px 0",
  listStyle: "none",
};

type PositionType =
  | "rnd__menu--top"
  | "rnd__menu--bottom"
  | "rnd__menu--right"
  | "rnd__menu--left"
  | "";

const getPosition = (position: PositionType): SxProps<Theme> => {
  switch (position) {
    case "rnd__menu--top":
      return {
        top: "auto",
        bottom: "100%",
      };
    case "rnd__menu--bottom":
      return {
        top: "100%",
        bottom: "auto",
      };
    case "rnd__menu--left":
      return {
        left: "auto",
        right: 0,
      };
    case "rnd__menu--right":
      return {
        left: 0,
        right: "auto",
      };
    case "":
      return {};
    default:
      return {};
  }
};

const getSubmenuPosition = (position: PositionType): SxProps<Theme> => {
  switch (position) {
    case "rnd__menu--top":
      return {
        top: "auto",
        bottom: "0",
      };
    case "rnd__menu--bottom":
      return {
        top: "0",
        bottom: "auto",
      };
    case "rnd__menu--left":
      return {
        left: "auto",
        right: "100%",
      };
    case "rnd__menu--right":
      return {
        left: "100%",
        right: "auto",
      };
    case "":
      return {};
    default:
      return {};
  }
};

export const Dropdown = <TValue,>({
  items,
  containerWidth = 300,
  onSelect,
  children,
  className,
  renderOption,
  closeOnScroll = true,
}: DropdownProps<TValue>): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuPositionClassName, setMenuPositionClassName] =
    useState<PositionType>("");
  const [dropdownIsOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = useCallback(
    () => setDropdownOpen((state) => !state),
    []
  );
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const childrenProps = useMemo(() => {
    return {
      isOpen: dropdownIsOpen,
      onClick: toggleDropdown,
    };
  }, [dropdownIsOpen, toggleDropdown]);

  const handleSelect = React.useCallback(
    (item: DropdownItem<TValue>) => {
      if (item.disabled) {
        return;
      }

      if (item.onSelect) {
        item.onSelect();
      } else if (item.value !== undefined && onSelect) {
        onSelect(item.value, item);
      }
      closeDropdown();
    },
    [closeDropdown, onSelect]
  );

  useClickAway(containerRef, closeDropdown);

  const scrollListener = React.useCallback(
    (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el?.classList?.contains("rnd__menu")) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    if (dropdownIsOpen && closeOnScroll) {
      document.addEventListener("scroll", scrollListener, true);
    }
    return () => {
      document.removeEventListener("scroll", scrollListener, true);
    };
  }, [closeOnScroll, dropdownIsOpen, scrollListener]);

  const rootMenuRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (dropdownIsOpen && rootMenuRef.current) {
      setMenuPositionClassName(
        getMenuPositionClassName(rootMenuRef.current) as PositionType
      );
    }
    return () => {
      if (dropdownIsOpen) {
        setMenuPositionClassName("");
      }
    };
  }, [dropdownIsOpen]);

  return (
    <Grid
      sx={{
        position: "relative",
        width: "fit-content",
        boxSizing: "border-box",
        "& *": {
          boxSizing: "border-box",
        },
      }}
      className={clsx("rnd", className)}
      ref={containerRef}
    >
      {children(childrenProps)}
      {dropdownIsOpen && (
        <Grid
          component="ul"
          sx={{
            ...rootMenuStyle,
            ...menuStyle,
            ...getPosition(menuPositionClassName),
          }}
          className={`rnd__root-menu rnd__menu ${menuPositionClassName}`}
          style={{ width: containerWidth }}
          ref={rootMenuRef}
        >
          {items.map((item, index) => (
            <Option
              key={index}
              option={item}
              onSelect={handleSelect}
              renderOption={renderOption}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
};

interface OptionProps<TValue> {
  option: DropdownItem<TValue>;
  onSelect: (item: DropdownItem<TValue>) => void;
  renderOption?: (option: DropdownItem<TValue>) => React.ReactNode;
}

const Option = <TValue,>({
  option,
  onSelect,
  renderOption,
}: OptionProps<TValue>): React.ReactElement => {
  const items = option.items;
  const hasSubmenu = !!items;
  const itemsContainerWidth = option.itemsContainerWidth ?? 150;
  const [menuPositionClassName, setMenuPositionClassName] =
    useState<PositionType>("");
  const [submenuIsOpen, setSubmenuOpen] = useState(false);

  const handleClick = React.useCallback(
    (e: UIEvent) => {
      if (hasSubmenu) return;

      e.stopPropagation();
      onSelect(option);
    },
    [hasSubmenu, onSelect, option]
  );

  const submenuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const submenuElement = submenuRef.current;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const isHTMLElement = entry.target instanceof HTMLElement;
        if (isHTMLElement) {
          setSubmenuOpen(entry.target.offsetWidth > 0);
          setMenuPositionClassName(
            getMenuPositionClassName(entry.target) as PositionType
          );
        }
      });
    });

    if (submenuElement) {
      observer.observe(submenuElement);
    }

    return () => {
      if (submenuElement) {
        observer.unobserve(submenuElement);
      }
    };
  }, []);

  const iconAfter = hasSubmenu ? chevronNode : option.iconAfter;

  const submenuStyle: SxProps<Theme> = {
    position: "absolute",
    display: "none",
    opacity: 0,
    left: "100%",
    top: 0,
  };

  const submenuOpenedStyle: SxProps<Theme> = submenuIsOpen
    ? {
        opacity: 1,
      }
    : {};

  const optionStyle: SxProps<Theme> = {
    padding: "12px 15px",
    cursor: "pointer",
    wordBreak: "break-word",
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    "&:not(.rnd__option--disabled):hover": {
      background: "gray",
    },
  };

  const optionWithMenuStyle: SxProps<Theme> = hasSubmenu
    ? {
        "&:hover > .rnd__submenu": {
          display: "block",
        },
      }
    : {};

  const optionDisabledStyle: SxProps<Theme> = option.disabled
    ? {
        cursor: "not-allowed",
        opacity: "0.4",
      }
    : {};

  const optionIconStyle = {
    width: "16px",
    ehgit: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <Grid
      component="li"
      sx={{
        ...optionStyle,
        ...optionDisabledStyle,
        ...optionWithMenuStyle,
      }}
      className={clsx("rnd__option", option.className, {
        "rnd__option--disabled": option.disabled,
        "rnd__option--with-menu": hasSubmenu,
      })}
      onMouseDown={handleClick}
      onKeyUp={handleClick}
    >
      {hasSubmenu && (
        <Grid
          component="ul"
          sx={{
            ...menuStyle,
            ...submenuStyle,
            ...submenuOpenedStyle,
            ...getSubmenuPosition(menuPositionClassName),
          }}
          className={clsx(`rnd__menu rnd__submenu ${menuPositionClassName}`, {
            "rnd__submenu--opened": submenuIsOpen,
          })}
          ref={submenuRef}
          style={{ width: itemsContainerWidth }}
        >
          {items.map((item, index) => (
            <Option
              key={index}
              option={item}
              onSelect={onSelect}
              renderOption={renderOption}
            />
          ))}
        </Grid>
      )}
      {renderOption && renderOption(option)}
      {!renderOption && (
        <>
          {option.iconBefore && (
            <Grid
              sx={{ marginRight: "7px", ...optionIconStyle }}
              className="rnd__option-icon rnd__option-icon--left"
            >
              {option.iconBefore}
            </Grid>
          )}
          <Grid
            component="p"
            sx={{
              fontWeight: 600,
              fontSize: "11px",
              margin: 0,
            }}
          >
            {option.label}
          </Grid>
          {iconAfter && (
            <Grid
              sx={{ marginLeft: "auto", ...optionIconStyle }}
              className="rnd__option-icon rnd__option-icon--right"
            >
              {iconAfter}
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

const chevronNode = (
  <div
    style={{
      border: "5px solid currentColor",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderTopColor: "transparent",
      width: 0,
      height: 0,
    }}
  />
);
