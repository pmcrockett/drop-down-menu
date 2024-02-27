import {
  createSvg,
  elementIsOrContainsElement,
  nodeListContainsClass,
  nodeListContainsElement,
} from "./dom-utilities.js";

const defaultHoverDelay = 500;

class DropdownBar {
  dropdowns = [];
  htmlBar;

  // _htmlBar is a <div class="dropdown-bar"> containing at least one button or
  // div of class "dropdown-anchor".
  constructor(_htmlBar) {
    this.htmlBar = _htmlBar;
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
  htmlAnchor;

  // _htmlDropdownAnchor is a <div class="dropdown-anchor"> or
  // <button class="dropdown-anchor"> that contains at least one <div> with menu
  // item data.
  constructor(_htmlDropdownAnchor) {
    this.htmlAnchor = _htmlDropdownAnchor;
    this.hoverDelay =
      _htmlDropdownAnchor.getAttribute("hoverdelay") || defaultHoverDelay;

    // The dropdown's anchor is always at this.origins[0].
    this.origins.push(new DropdownOrigin(_htmlDropdownAnchor, this.hoverDelay));
    const suborigins = _htmlDropdownAnchor.querySelectorAll(".dropdown-expand");

    for (const origin of suborigins) {
      this.origins.push(new DropdownOrigin(origin, this.hoverDelay));
    }

    this.attachMouseEnterListener();
    this.attachClickListener();
    this.attachResizeListener();
    this.attachCloseOnSelectListeners();
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
      this.htmlAnchor.classList.contains("opened") &&
      !elementIsOrContainsElement(this.htmlAnchor, _clickTarget)
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
    this.htmlAnchor.addEventListener("mouseenter", (_event) => {
      this.closeDeeperThanMouse(_event.clientX, _event.clientY, false);
    });
  }

  attachClickListener() {
    document.addEventListener("mousedown", (_event) => {
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

  attachCloseOnSelectListeners() {
    const itemDivs = this.htmlAnchor.querySelectorAll(
      ".dropdown > div > div:first-of-type"
    );

    for (const item of itemDivs) {
      if (
        item.getAttribute("closeonselect") === "true" &&
        item.getAttribute("enabled") !== "false"
      ) {
        item.addEventListener("mousedown", (_event) => {
          if (_event.button === 0) {
            this.closeHierarchy();
          }
        });
      }
    }
  }
}

class DropdownOrigin {
  enterTime;
  htmlElem;
  menuElem;
  itemElem;
  menuItemOuterDivs;
  menuItemContentDivs = [];
  menuOpenTimeout;
  menuCloseTimeout;
  hoverDelay;
  popDirection;
  appearAnimRunning = false;
  isAnchor;

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
    this.menuItemOuterDivs = this.getAllMenuItemsAtThisDropdownLevel();
    this.isAnchor = this.htmlElem.classList.contains("dropdown-anchor");
    let popDir;

    if (!this.isAnchor) {
      popDir = _htmlElem.getAttribute("popdirection") || "right-bottom";
      this.appendSubmenuArrow();
      this.itemElem = _htmlElem.querySelector(
        ".dropdown > div > div:first-of-type"
      );
    } else {
      popDir = _htmlElem.getAttribute("popdirection") || "bottom-right";
      this.itemElem = _htmlElem.querySelector(
        ".dropdown-anchor > div:first-of-type"
      );
    }

    this.popDirection = popDir.split("-");
    this.hoverDelay = _hoverDelay || defaultHoverDelay;

    let openOnHover = _htmlElem.getAttribute("onset");

    if (!openOnHover) {
      openOnHover = this.isAnchor ? "false" : "true";
    }

    this.attachMouseEnterListener(openOnHover === "true");
    this.attachClickListener();
    this.attachMouseLeaveListeners();
    this.attachAnimListeners();
  }

  getAllMenuItemsAtThisDropdownLevel() {
    const divs = [this.menuElem.querySelector(".dropdown > div")];
    let nextDiv = divs[0].nextSibling;

    while (nextDiv) {
      if (
        nextDiv.nodeType === 1 &&
        !nextDiv.classList.contains("dropdown-spacer")
      ) {
        divs.push(nextDiv);
      }

      nextDiv = nextDiv.nextSibling;
    }

    return divs;
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
    if (this.isAnchor) {
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
    const screenEdgeMargin = 5;
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
      this.menuElem.style.left = `${leftNum - rect.left + screenEdgeMargin}px`;
    } else if (rect.right >= vw - screenEdgeMargin) {
      this.menuElem.style.left = `${leftNum - (rect.right - vw + screenEdgeMargin)}px`;
    }

    if (rect.top <= screenEdgeMargin) {
      this.menuElem.style.top = `${topNum - rect.top + screenEdgeMargin}px`;
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

    this.menuItemContentDivs.forEach((_div) => {
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

          if (this.isAnchor) {
            this.htmlElem.classList.remove("highlighted");
          }

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

  attachMouseEnterListener(_openOnHover) {
    this.htmlElem.addEventListener("mouseenter", () => {
      if (_openOnHover) {
        this.scheduleOpenMenu();
      }
    });
  }

  attachClickListener() {
    this.htmlElem.addEventListener("mousedown", (_event) => {
      if (_event.button === 0) {
        this.toggleOpenMenu(_event.clientX, _event.clientY);
      }
    });
  }

  attachMouseLeaveListeners() {
    this.htmlElem.addEventListener("mouseleave", (_event) => {
      this.scheduleCloseMenu(_event.clientX, _event.clientY);

      // If we're hovering over a hover-to-open anchor and move away before it
      // opens the dropdown, remove the highlight.
      if (
        this.htmlElem.getAttribute("onset") !== "click" &&
        !this.htmlElem.classList.contains("opened")
      ) {
        this.htmlElem.classList.remove("highlighted");
      }
    });

    for (const div of this.menuItemOuterDivs) {
      const menuItem = div.querySelector(".dropdown > div > div:first-of-type");
      this.menuItemContentDivs.push(menuItem);
      div.addEventListener("mouseleave", () => {
        this.addMouseoverClass(menuItem);
      });
    }
  }

  attachAnimListeners() {
    this.menuElem.addEventListener("animationend", (_event) => {
      if (_event.animationName === "dropdown-appear") {
        this.appearAnimRunning = false;
        this.repositionOffscreenMenu();
      }
    });

    this.menuElem.addEventListener("animationcancel", (_event) => {
      if (_event.animationName === "dropdown-appear") {
        this.appearAnimRunning = false;
      }
    });

    this.menuElem.addEventListener("animationstart", (_event) => {
      if (_event.animationName === "dropdown-appear") {
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

// Calling this function from the code that imports it will read the dropdown
// structures in the HTML and construct full dropdown menus out of them.
export function createDropdowns() {
  const htmlMenuBars = document.querySelectorAll(".dropdown-bar");
  const htmlLoneAnchors = document.querySelectorAll(
    "*:not(.dropdown-bar) > div.dropdown-anchor, *:not(.dropdown-bar) > button.dropdown-anchor"
  );

  const bars = [];
  const anchors = [];

  htmlMenuBars.forEach((_bar) => {
    bars.push(new DropdownBar(_bar));
  });

  htmlLoneAnchors.forEach((_anchor) => {
    anchors.push(new Dropdown(_anchor));
  });

  return {
    anchors,
    bars,
  };
}

export function getDropdownItems(_source) {
  if (!_source) {
    return document.querySelectorAll(".dropdown > div > div:first-of-type");
  } else if (_source instanceof DropdownBar) {
    return _source.htmlBar.querySelectorAll(
      ".dropdown > div > div:first-of-type"
    );
  } else if (_source instanceof Dropdown) {
    return _source.htmlAnchor.querySelectorAll(
      ".dropdown > div > div:first-of-type"
    );
  }
}
