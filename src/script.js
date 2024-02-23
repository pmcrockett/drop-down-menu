import * as dom from "./dom-utilities.js";

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
        this.origins.forEach((_origin) => {
          _origin.htmlElem.classList.remove("highlighted");
          _origin.htmlElem.classList.remove("opened");
        });
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
    this.appendSubmenuArrow(_htmlElem);
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

    const svg = dom.createSvg(
      "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
    );
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
        "calc(calc(0px - var(--dropdown-anchor-padding)) - var(--dropdown-anchor-border-width))";
      this.menuElem.style.top =
        "calc(calc(100% + var(--dropdown-anchor-padding)))";
    } else {
      this.menuElem.style.left = "calc(100% + 1em)";
      this.menuElem.style.top =
        "calc(calc(calc(calc(100% - 1em) - calc(var(--dropdown-vert-margin) * 2)) - var(--dropdown-border-width) + 1px))";
    }

    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;
    console.log(vw);
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

const menus = [];
const htmlMenus = document.querySelectorAll(".dropdown-anchor");
for (const menu of htmlMenus) {
  menus.push(new Dropdown(menu));
}
