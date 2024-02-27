# [PROJECT TITLE]

!["IMAGE ALT TEXT"](/images/IMAGE_TITLE.jpg?raw=true "IMAGE TEXT")

Live version at [PUT WEB ADDRESS HERE]

# Basic dropdown anatomy

```html
<!-- Creates a menu bar. -->
<div class="dropdown-bar">
  <!-- Creates a dropdown menu on the bar. -->
  <button class="dropdown-anchor">
    <!-- Creates the text for the dropdown anchor. -->
    <div>Anchor</div>
    <!-- Wraps the content of the dropdown menu. -->
    <div class="dropdown">
      <!-- Creates a menu item. -->
      <div class="dropdown-item">
        <!-- Creates the text and content of the menu item. -->
        <div>Menu item</div>
        <!-- Creates an optional link for the menu item if you don't want to
    implement a click listener. -->
        <a href="https://some-web-address"></a>
      </div>
      <!-- Creates a menu item that is an unselectable horizontal rule. -->
      <div class="dropdown-spacer"></div>
      <!-- Creates a menu item that expands into a submenu. -->
      <div class="dropdown-expand">
        <!-- Creates the text for the menu item. -->
        <div>Submenu</div>
        <!-- Wraps the content of the submenu. -->
        <div class="dropdown">
          <div class="dropdown-item">
            <!-- This menu item doesn't use a web link. -->
            <div>No web link</div>
          </div>
          <div class="dropdown-item">
            <!-- This menu item includes an icon to the left of its text. -->
            <div>
              <div class="dropdown-left">
                <img src="./image.svg" />Includes icon
              </div>
            </div>
          </div>
          <div class="dropdown-item">
            <!-- This menu item includes a shortcut description to the right of
        its text. -->
            <div>
              Includes shortcut
              <div class="dropdown-right">Ctrl+I</div>
            </div>
          </div>
          <div class="dropdown-item">
            <!-- This menu item has both an icon and a shortcut description. -->
            <div>
              <div class="dropdown-left">
                <img src="./image.svg" />Icon and shortcut
              </div>
              <div class="dropdown-right">Ctrl+Shift+I</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </button>
</div>
```

# HTML elements

## `<div class="dropdown-bar">`

Creates an OS-like menu bar. Nesting elements with the class `"dropdown-anchor"`
inside of this bar creates menu items on the bar.

**Attributes:**

`direction`: `"vertical"` | `"horizontal"` (default: `"horizontal"`)
Direction of the menu bar.

---

## `<button class="dropdown-anchor">`

## `<div class="dropdown-anchor">`

Creates a button that pops a dropdown menu. Can be nested inside of
`<div class="dropdown-bar">` but doesn't need to be. Nesting
`<div class="dropdown">` inside of the anchor creates the actual menu.

**Attributes:**

**`onset`**: `"click"` | `"hover"` (default: `"click"`)
Whether the menu is popped by clicking or hovering.

**`hoverdelay`**: number (default: `"500"`)
Delay in milliseconds before hovering pops the menu.

**`popdirection`**: `"bottom-right"` | `"bottom-left"` | `"top-right"` | `"top-left"`
| `"right-bottom"` | `"right-top"` | `"left-bottom"` | `"left-top"` (default:
`"bottom-right"`)
Controls where the menu appears relative to the anchor when it pops. The first
direction determines the side of the anchor the menu appears on and the second
direction determines the direction in which the menu's other axis is allowed to
expand.

**`enabled`**: `true` | `false` (default: `true`)
Whether the menu button is enabled. If not enabled, the button's text will be
grayed out using the color defined with `--dropdown-disabled-font-color` and
will not pop its menu if pressed.

---

## `<div class="dropdown">`

Creates a dropdown menu. Must be nested inside of an element with the
`"dropdown-anchor"` class. Nesting `<ul>` elements inside of the dropdown
creates menu items.

---

## `<ul class="dropdown-spacer">`

Creates an unselectable horizontal rule within the dropdown menu.

---

## `<ul><div>[Item content]</div><a></a></ul>`

Creates an item within the dropdown menu. The `<div>`/`<a>` element defines the
item's clickable area, and all item content should be nested within it. If the
menu item requires a JavaScript click listener, this listener should be attached
to the `<div>`/`<a>` element.

**Attributes (applied to <ul\>):**

**`enabled`**: `true` | `false` (default: `true`)
Whether the menu item is enabled. If not enabled, the menu item's text will be
grayed out using the color defined with `--dropdown-disabled-font-color`. If the
`<ul>` uses class `"dropdown-expand"`, it will not pop its submenu.

Note that applying `enabled="false"` does not automatically disable a menu
item's function. If the menu item uses a link defined with `<a>`, that link will
still be active. If there is a JavaScript listener applied to the menu item, the
listener must check whether the item's `.getAttribute("enabled")` equals
`"false"` if it needs to identify a disabled state.

---

## `<div class="dropdown-left">`

Enables the division of the left-aligned portion of a menu item into multiple
units, e.g. an icon with text. All of these subdivided elements should be
nested inside `<div class="dropdown-left">`. Using `<div class="dropdown-left">`
is not necessary if the menu item has only one left-aligned unit, e.g. only
text.

To align the text of menu items without icons with the text of menu
items that include icons, the former should use the `"dropdown-left"` class but
replace the image with an empty `<div>`, e.g.
`<div class="dropdown-left"><div></div>Item text</div>`, which creates an empty
space instead of an icon.

---

## `<div class="dropdown-right">`

Creates a right-aligned unit within the menu item, such as is usually used to
display a keyboard shortcut.

---

## `<ul class="dropdown-expand">`

Allows the nesting of a submenu within a menu item. The submenu is created by
nesting `<div class="dropdown">` inside of `<ul class="dropdown-expand">` after
the `<div>` element that contains the item content. Automatically creates
an arrow beside the menu item to indicate a submenu.

**Attributes:**

**`popdirection`**: `"right-down"` | `"right-up"` | `"left-down"` | `"left-up"`
(default: `"right-down"`)
Controls where the submenu appears relative to the menu item when it pops. The
first direction determines the side of the menu item the submenu appears on and
the second direction determines the direction in which the submenu's other axis
is allowed to expand.

---
