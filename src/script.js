import * as dom from "./dom-utilities.js";

class DropdownBar {
  dropdowns = [];

  constructor(_htmlBar) {
    const htmlMenus = _htmlBar.querySelectorAll(".dropdown-anchor");

    htmlMenus.forEach((_elem) => {
      this.dropdowns.push(new Dropdown(_elem));
    });

    this.attachHoverListeners();
  }

  attachHoverListeners() {
    this.dropdowns.forEach((_dropdown) => {
      this.attachHoverListener(_dropdown);
    });
  }

  attachHoverListener(_dropdown) {
    _dropdown.origins[0].htmlElem.addEventListener("mouseenter", () => {
      let needMenuOpen = false;

      this.dropdowns.forEach((_menu) => {
        if (
          _menu != _dropdown &&
          _menu.origins[0].htmlElem.classList.contains("opened")
        ) {
          needMenuOpen = true;
          _menu.closeHierarchy();
        }
      });

      if (needMenuOpen) {
        _dropdown.origins[0].htmlElem.classList.add("opened");
        _dropdown.origins[0].htmlElem.classList.add("highlighted");
        _dropdown.origins[0].repositionOffscreenMenu();
      }
    });
  }
}

class Dropdown {
  origins = [];
  hoverDelay;

  constructor(_htmlMenu) {
    this.hoverDelay = _htmlMenu.getAttribute("hoverdelay") || 500;
    this.origins.push(new DropdownOrigin(_htmlMenu, this.hoverDelay));
    const suborigins = _htmlMenu.querySelectorAll(".dropdown-expand");

    for (const origin of suborigins) {
      this.origins.push(new DropdownOrigin(origin, this.hoverDelay));
    }

    this.attachMouseEnterListener(_htmlMenu);
    this.attachClickListener(_htmlMenu);
    this.attachReizeListener();
  }

  closeHierarchy() {
    this.origins.forEach((_origin) => {
      _origin.htmlElem.classList.remove("highlighted");
      _origin.htmlElem.classList.remove("opened");
    });
  }

  // If we move the mouse back into the opened menu hierarchy, close any opened
  // submenus that are no longer valid with the new mouse position.
  attachMouseEnterListener(_htmlElem) {
    _htmlElem.addEventListener("mouseenter", (_event) => {
      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );
      let menuUnderMouse;

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

      for (const submenu of submenus) {
        submenu.classList.remove("highlighted");
        submenu.menuCloseTimeout = setTimeout(() => {
          if (!submenu.classList.contains("highlighted")) {
            submenu.classList.remove("opened");
          }
        }, this.hoverDelay);
      }
    });
  }

  // Listen for clicks outside of the menu hierarchy and close the entire
  // hierarchy if one occurs.
  attachClickListener(_htmlElem) {
    document.addEventListener("click", (_event) => {
      if (
        _htmlElem.classList.contains("opened") &&
        !dom.elementIsOrContainsElement(_htmlElem, _event.target)
      ) {
        this.closeHierarchy();
      }
    });
  }

  // We attach the resize listener to Dropdown instead of individual
  // DropdownOrigins to reduce the number of checks made on resize by closed
  // menus.
  attachReizeListener() {
    window.addEventListener("resize", () => {
      if (this.origins[0].htmlElem.classList.contains("opened")) {
        this.origins[0].repositionOffscreenMenu();

        for (let i = 1; i < this.origins.length; i++) {
          if (this.origins[i].htmlElem.classList.contains("opened")) {
            this.origins[i].repositionOffscreenMenu();
          }
        }
      }
    });
  }
}

class DropdownOrigin {
  enterTime;
  htmlElem;
  menuElem;
  menuOpenTimeout;
  menuCloseTimeout;
  hoverDelay;

  constructor(_htmlElem, _hoverDelay) {
    if (!_htmlElem.classList.contains("dropdown-anchor")) {
      this.appendSubmenuArrow(_htmlElem);
    }

    this.hoverDelay = _hoverDelay || 500;

    if (_htmlElem.getAttribute("onset") === "click") {
      this.attachClickListener(_htmlElem);
    } else {
      this.attachHoverListener(_htmlElem);
    }

    this.htmlElem = _htmlElem;
    this.menuElem = _htmlElem.querySelector(".dropdown");
  }

  appendSubmenuArrow(_htmlElem) {
    const menu = _htmlElem.querySelector(".dropdown");
    if (!menu) return;

    const svg = dom.createSvg("M10,17L15,12L10,7V17Z");
    svg.classList.add("dropdown-expand-img");
    _htmlElem.insertBefore(svg, menu);
  }

  getMenuWidth() {
    return window.getComputedStyle(this.menuElem).getPropertyValue("width");
  }

  repositionOffscreenMenu() {
    // Ensure default position so we can check whether the menu is offscreen.
    if (this.htmlElem.classList.contains("dropdown-anchor")) {
      this.menuElem.style.left =
        "calc(var(--dropdown-anchor-border-width-horiz) * -1)";
      this.menuElem.style.top =
        "calc(100% - var(--dropdown-anchor-border-width-vert))";
    } else {
      this.menuElem.style.left = "100%";
      this.menuElem.style.top = "calc(var(--dropdown-border-width) * -1)";
    }

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

    if (rect.left <= 0) {
      this.menuElem.style.left = `${leftNum - rect.left}px`;
    } else if (rect.right >= vw) {
      this.menuElem.style.left = `${leftNum - (rect.right - vw)}px`;
    }

    if (rect.top <= 0) {
      this.menuElem.style.top = `${topNum - rect.top}px`;
    } else if (rect.bottom >= vh) {
      this.menuElem.style.top = `${topNum - (rect.bottom - vh)}px`;
    }
  }

  attachHoverListener(_htmlElem) {
    _htmlElem.addEventListener("mouseenter", () => {
      _htmlElem.classList.add("highlighted");
      this.menuOpenTimeout = setTimeout(() => {
        _htmlElem.classList.add("opened");
        clearTimeout(this.menuCloseTimeout);
        this.repositionOffscreenMenu();
      }, this.hoverDelay);
    });

    this.attachMouseLeaveListener(_htmlElem);
  }

  attachClickListener(_htmlElem) {
    _htmlElem.addEventListener("click", (_event) => {
      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );

      if (dom.nodeListContainsElement(underMouse, _htmlElem)) {
        if (_htmlElem.classList.contains("opened")) {
          _htmlElem.classList.remove("highlighted");
          _htmlElem.classList.remove("opened");
        } else {
          _htmlElem.classList.add("highlighted");
          _htmlElem.classList.add("opened");
          this.repositionOffscreenMenu();
        }
      }

      clearTimeout(this.menuCloseTimeout);
    });

    this.attachMouseLeaveListener(_htmlElem);
  }

  attachMouseLeaveListener(_htmlElem) {
    _htmlElem.addEventListener("mouseleave", (_event) => {
      clearTimeout(this.menuOpenTimeout);

      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );

      if (dom.nodeListContainsClass(underMouse, "dropdown")) {
        _htmlElem.classList.remove("highlighted");
        this.menuCloseTimeout = setTimeout(() => {
          if (!_htmlElem.classList.contains("highlighted")) {
            _htmlElem.classList.remove("opened");
          }
        }, this.hoverDelay);
      }
    });
  }
}

new DropdownBar(document.querySelector(".dropdown-bar"));
