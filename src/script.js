// TODO: Add listeners to menu items so the menu can auto close on selection.

import {
  createSvg,
  elementIsOrContainsElement,
  nodeListContainsClass,
  nodeListContainsElement,
} from "./dom-utilities.js";

const defaultHoverDelay = 500;

class DropdownBar {
  dropdowns = [];

  // _htmlBar is a <div class="dropdown-bar"> containing at least one button or
  // div of class "dropdown-anchor".
  constructor(_htmlBar) {
    const htmlMenus = _htmlBar.querySelectorAll(".dropdown-anchor");

    htmlMenus.forEach((_elem) => {
      this.dropdowns.push(new Dropdown(_elem));
    });

    this.attachMouseEnterListeners();
  }

  attachMouseEnterListeners() {
    this.dropdowns.forEach((_dropdown) => {
      this.attachMouseEnterListener(_dropdown);
    });
  }

  attachMouseEnterListener(_dropdown) {
    const anchor = _dropdown.getAnchor();

    anchor.htmlElem.addEventListener("mouseenter", () => {
      this.switchOpenedDropdowns(_dropdown);
    });
  }

  switchOpenedDropdowns(_targetDropdown) {
    const targetAnchor = _targetDropdown.getAnchor();

    if (targetAnchor.isEnabled()) {
      const needMenuOpen = this.closeOpenedDropdowns([_targetDropdown]);

      if (needMenuOpen) {
        targetAnchor.openDropdown();
        targetAnchor.htmlElem.classList.add("highlighted");
      }
    }
  }

  closeOpenedDropdowns(_keepOpen) {
    let numClosed = 0;

    this.dropdowns.forEach((_menu) => {
      if (
        !_keepOpen.includes(_menu) &&
        _menu.getAnchor().htmlElem.classList.contains("opened")
      ) {
        numClosed++;
        _menu.closeHierarchy();
      }
    });

    return numClosed;
  }
}

class Dropdown {
  origins = [];
  hoverDelay;
  htmlMenu;

  // _htmlMenu is a <div class="dropdown"> that contains at least one <ul> with
  // menu item data.
  constructor(_htmlMenu) {
    this.htmlMenu = _htmlMenu;
    this.hoverDelay = _htmlMenu.getAttribute("hoverdelay") || defaultHoverDelay;

    // The dropdown's anchor is always at this.origins[0].
    this.origins.push(new DropdownOrigin(_htmlMenu, this.hoverDelay));
    const suborigins = _htmlMenu.querySelectorAll(".dropdown-expand");

    for (const origin of suborigins) {
      this.origins.push(new DropdownOrigin(origin, this.hoverDelay));
    }

    this.attachMouseEnterListener();
    this.attachClickListener();
    this.attachResizeListener();
  }

  getAnchor() {
    return this.origins[0];
  }

  closeHierarchy() {
    this.origins.forEach((_origin) => {
      _origin.htmlElem.classList.remove("highlighted");
      _origin.htmlElem.classList.remove("opened");
    });
  }

  closeDeeperThanMouse(_mouseX, _mouseY, _immediate) {
    const underMouse = document.elementsFromPoint(_mouseX, _mouseY);
    let menuUnderMouse;

    // Find the actual HTML element for this dropdown. Can't just use
    // _event.target because that gives us the anchor element, not the
    // submenu element.
    for (const elem of underMouse) {
      if (elem.classList.contains("dropdown")) {
        menuUnderMouse = elem;
        break;
      }
    }

    if (!menuUnderMouse) return;

    const submenus = menuUnderMouse.querySelectorAll(
      ".dropdown-expand, .dropdown-anchor"
    );

    // Unhighlight/close any menus deeper than the menu the mouse moved into.
    for (const submenu of submenus) {
      if (_immediate) {
        if (!submenu.classList.contains("highlighted")) {
          submenu.classList.remove("opened");
        }
      } else {
        submenu.classList.remove("highlighted");
        submenu.menuCloseTimeout = setTimeout(() => {
          if (!submenu.classList.contains("highlighted")) {
            submenu.classList.remove("opened");
          }
        }, this.hoverDelay);
      }
    }
  }

  // Listen for clicks outside of the menu hierarchy and close the entire
  // hierarchy if one occurs.
  closeOnClickOutsideHierarchy(_clickTarget) {
    if (
      this.htmlMenu.classList.contains("opened") &&
      !elementIsOrContainsElement(this.htmlMenu, _clickTarget)
    ) {
      this.closeHierarchy();
    }
  }

  repositionOffscreenDropdowns() {
    if (this.getAnchor().htmlElem.classList.contains("opened")) {
      this.getAnchor().repositionOffscreenMenu();

      for (let i = 1; i < this.origins.length; i++) {
        if (this.origins[i].htmlElem.classList.contains("opened")) {
          this.origins[i].repositionOffscreenMenu();
        }
      }
    }
  }

  attachMouseEnterListener() {
    this.htmlMenu.addEventListener("mouseenter", (_event) => {
      this.closeDeeperThanMouse(_event.clientX, _event.clientY, false);
    });
  }

  attachClickListener() {
    document.addEventListener("click", (_event) => {
      this.closeOnClickOutsideHierarchy(_event.target);
      this.closeDeeperThanMouse(_event.clientX, _event.clientY, true);
    });
  }

  // We attach the resize listener to Dropdown instead of individual
  // DropdownOrigins to reduce the number of checks made on resize by closed
  // menus.
  attachResizeListener() {
    window.addEventListener(
      "resize",
      this.repositionOffscreenDropdowns.bind(this)
    );
  }
}

class DropdownOrigin {
  enterTime;
  htmlElem;
  menuElem;
  itemElem;
  menuItemUls;
  menuItemDivs = [];
  menuOpenTimeout;
  menuCloseTimeout;
  hoverDelay;
  popDirection;
  appearAnimRunning = false;

  static positionOffsetValues = {
    negativeAnchorHorizBorderOffset:
      "calc(var(--dropdown-anchor-border-width-horiz) * -1)",
    negativeAnchorVertBorderOffset:
      "calc(var(--dropdown-anchor-border-width-vert) * -1)",
    negativeBorderOffset: "calc(var(--dropdown-border-width) * -1)",
    fullOffset: "100%",
  };

  static invertedDirections = {
    top: "bottom",
    bottom: "top",
    right: "left",
    left: "right",
  };

  constructor(_htmlElem, _hoverDelay) {
    this.htmlElem = _htmlElem;
    this.menuElem = _htmlElem.querySelector(".dropdown");
    this.menuItemUls = this.getAllUlsAtThisDropdownLevel();
    let popDir;

    if (!_htmlElem.classList.contains("dropdown-anchor")) {
      popDir = _htmlElem.getAttribute("popdirection") || "right-bottom";
      this.appendSubmenuArrow();
      this.itemElem = _htmlElem.querySelector("ul > div:first-child");
    } else {
      popDir = _htmlElem.getAttribute("popdirection") || "bottom-rightt";
      this.itemElem = _htmlElem.querySelector(
        ".dropdown-anchor > div:first-child"
      );
    }

    this.popDirection = popDir.split("-");
    this.hoverDelay = _hoverDelay || defaultHoverDelay;

    this.attachMouseEnterListener(_htmlElem.getAttribute("onset") !== "click");
    this.attachClickListener();
    this.attachMouseLeaveListeners();
    this.attachAnimListeners();
  }

  getAllUlsAtThisDropdownLevel() {
    const uls = [this.menuElem.querySelector("ul")];
    let nextUl = uls[0].nextSibling;

    while (nextUl) {
      if (
        nextUl.nodeType === 1 &&
        !nextUl.classList.contains("dropdown-spacer")
      ) {
        uls.push(nextUl);
      }

      nextUl = nextUl.nextSibling;
    }

    return uls;
  }

  appendSubmenuArrow() {
    const menu = this.htmlElem.querySelector(".dropdown");
    if (!menu) return;

    const svg = createSvg("M10,17L15,12L10,7V17Z");
    svg.classList.add("dropdown-expand-img");
    this.htmlElem.insertBefore(svg, menu);
  }

  setMenuToDefaultPosition() {
    let secondOffset;

    // Offset in the first direction does not correct for border width; offset
    // in the second direction does. An anchor may have separate horizontal and
    // vertical border widths.
    if (this.htmlElem.classList.contains("dropdown-anchor")) {
      if (this.popDirection[1] === "right" || this.popDirection[1] === "left") {
        secondOffset =
          DropdownOrigin.positionOffsetValues.negativeAnchorHorizBorderOffset;
      } else {
        secondOffset =
          DropdownOrigin.positionOffsetValues.negativeAnchorVertBorderOffset;
      }
    } else {
      secondOffset = DropdownOrigin.positionOffsetValues.negativeBorderOffset;
    }

    const invDir = [
      DropdownOrigin.invertedDirections[this.popDirection[0]],
      DropdownOrigin.invertedDirections[this.popDirection[1]],
    ];

    this.menuElem.style[this.popDirection[0]] = "";
    this.menuElem.style[invDir[0]] =
      DropdownOrigin.positionOffsetValues.fullOffset;
    this.menuElem.style[this.popDirection[1]] = "";
    this.menuElem.style[invDir[1]] = secondOffset;
    this.menuElem.style["transform-origin"] = `${invDir[0]} ${invDir[1]}`;
  }

  repositionOffscreenMenu() {
    const screenEdgeMargin = 10;
    this.setMenuToDefaultPosition();

    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;
    const rect = this.menuElem.getBoundingClientRect();
    const leftStr = window
      .getComputedStyle(this.menuElem)
      .getPropertyValue("left");
    const leftNum = Number(leftStr.replace("px", ""));
    const topStr = window
      .getComputedStyle(this.menuElem)
      .getPropertyValue("top");
    const topNum = Number(topStr.replace("px", ""));

    if (rect.left <= screenEdgeMargin) {
      this.menuElem.style.left = `${leftNum - rect.left - screenEdgeMargin}px`;
    } else if (rect.right >= vw - screenEdgeMargin) {
      this.menuElem.style.left = `${leftNum - (rect.right - vw + screenEdgeMargin)}px`;
    }

    if (rect.top <= screenEdgeMargin) {
      this.menuElem.style.top = `${topNum - rect.top - screenEdgeMargin}px`;
    } else if (rect.bottom >= vh - screenEdgeMargin) {
      this.menuElem.style.top = `${topNum - (rect.bottom - vh + screenEdgeMargin)}px`;
    }
  }

  isEnabled() {
    return this.itemElem.getAttribute("enabled") !== "false";
  }

  openDropdown() {
    this.htmlElem.classList.add("opened");
    this.repositionOffscreenMenu();

    this.menuItemDivs.forEach((_div) => {
      _div.classList.remove("mouseover");
    });

    this.itemElem.classList.add("mouseover");
  }

  scheduleOpenMenu() {
    if (this.isEnabled()) {
      this.htmlElem.classList.add("highlighted");
      this.menuOpenTimeout = setTimeout(() => {
        if (!this.htmlElem.classList.contains("opened")) {
          this.openDropdown();
          clearTimeout(this.menuCloseTimeout);
        }
      }, this.hoverDelay);
    }
  }

  scheduleCloseMenu(_mouseX, _mouseY) {
    if (this.isEnabled()) {
      clearTimeout(this.menuOpenTimeout);

      const underMouse = document.elementsFromPoint(_mouseX, _mouseY);

      if (nodeListContainsClass(underMouse, "dropdown")) {
        this.htmlElem.classList.remove("highlighted");
        this.menuCloseTimeout = setTimeout(() => {
          if (!this.htmlElem.classList.contains("highlighted")) {
            this.htmlElem.classList.remove("opened");
          }
        }, this.hoverDelay);
      }
    }
  }

  toggleOpenMenu(_mouseX, _mouseY) {
    if (this.isEnabled()) {
      const underMouse = document.elementsFromPoint(_mouseX, _mouseY);

      if (nodeListContainsElement(underMouse, this.htmlElem)) {
        if (this.htmlElem.classList.contains("opened")) {
          this.htmlElem.classList.remove("opened");
          clearTimeout(this.menuOpenTimeout);
        } else {
          this.htmlElem.classList.add("highlighted");
          this.openDropdown();
        }
      }

      clearTimeout(this.menuCloseTimeout);
    }
  }

  addMouseoverClass(_menuItem) {
    if (_menuItem.getAttribute("enabled") !== "false") {
      _menuItem.classList.add("mouseover");
    }
  }

  // TODO: Remove
  removeAllHighlights(_mouseX, _mouseY) {
    if (this.htmlElem.classList.contains("opened")) {
      const underMouse = document.elementsFromPoint(_mouseX, _mouseY);

      if (nodeListContainsElement(underMouse, this.menuElem)) {
        for (const ul of this.menuItemUls) {
          if (!nodeListContainsElement(underMouse, ul)) {
            ul.classList.remove("highlighted");
          }
        }
      }
    }
  }

  attachMouseEnterListener(_openOnHover) {
    this.htmlElem.addEventListener("mouseenter", () => {
      //this.removeAllHighlights(_event.clientX, _event.clientY);

      if (_openOnHover) {
        this.scheduleOpenMenu();
      }
    });
  }

  attachClickListener() {
    this.htmlElem.addEventListener("click", (_event) => {
      this.toggleOpenMenu(_event.clientX, _event.clientY);
    });
  }

  attachMouseLeaveListeners() {
    this.htmlElem.addEventListener("mouseleave", (_event) => {
      this.scheduleCloseMenu(_event.clientX, _event.clientY);
    });

    for (const ul of this.menuItemUls) {
      const menuItem = ul.querySelector("div:first-child");
      this.menuItemDivs.push(menuItem);
      ul.addEventListener("mouseleave", () => {
        this.addMouseoverClass(menuItem);
      });
    }
  }

  attachAnimListeners() {
    this.menuElem.addEventListener("animationend", (_event) => {
      if (_event.animationName === "appear") {
        this.appearAnimRunning = false;
        this.repositionOffscreenMenu();
      }
    });

    this.menuElem.addEventListener("animationcancel", (_event) => {
      if (_event.animationName === "appear") {
        this.appearAnimRunning = false;
      }
    });

    this.menuElem.addEventListener("animationstart", (_event) => {
      if (_event.animationName === "appear") {
        this.appearAnimRunning = true;
        this.updateMenuAnimPosition();
      }
    });
  }

  // If this lags the animation, increase the timeout interval.
  updateMenuAnimPosition() {
    setTimeout(() => {
      this.repositionOffscreenMenu();

      if (this.appearAnimRunning) {
        this.updateMenuAnimPosition();
      }
    }, 1);
  }
}

new DropdownBar(document.querySelector(".dropdown-bar"));
const saveItem = document.querySelector(".save");
saveItem.addEventListener("click", () => {
  if (saveItem.getAttribute("enabled") !== "false") {
    console.log(saveItem);
  }
});
