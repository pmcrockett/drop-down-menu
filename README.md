# os-like-dropdown

!["Dropdown demo"](./images/dropdown-demo2.jpg?raw=true "Dropdown demo")

Live demo at https://pmcrockett.github.io/os-like-dropdown

# Usage

os-like-dropdown is not on npm (yet). To use it manually, put 
os-like-dropdown.js and dom-utilities.js in the same folder as your script and 
import the module with `import * as name from "./os-like-dropdown.js";` or 
`import { createDropdowns, getDropdownItems } from "./os-like-dropdown.js";` 
Include os-like-dropdown.css as a stylesheet in your HTML document (e.g. 
`<link rel="stylesheet" href="./os-like-dropdown.css" />`).

You must call `createDropdowns()` to create the dropdown menus you've defined 
in your HTML. `createDropdowns()` returns an object in the form 
`{ bars, anchors }`. `bars` contains an array of the menu bars present in the 
HTML document, and `anchors` contains an array of any menu anchors that aren't 
associated with menu bars. 

To get an array of menu items that you can attach event listeners to, call 
`getDropdownItems()` after `createDropdowns()`. With no argument, 
`getDropdownItems()` returns the items from all menu bars and anchors. 
Optionally, an array element from the `bars` or `anchors` arrays returned by 
`createDropsdowns()` can be passed as an argument into `getDropdownItems()` to 
get only the items present in that menu bar or menu anchor. 

# Basic dropdown anatomy

The following HTML creates this menu:

!["Dropdown example"](./images/dropdown-demo1.jpg?raw=true "Dropdown example")

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

```html
<div class="dropdown-bar">!!!!!!!!!!!!!!!!
  <button class="dropdown-anchor">
    <div>Anchor</div>
```

Creates an OS-like menu bar. Nesting buttons with the class `"dropdown-anchor"`
inside of this bar creates menu items on the bar.

#### Attributes (default value in bold):

`direction`: `"vertical"` | **`"horizontal"`** Direction of the menu bar.

---

## `<button class="dropdown-anchor">`

```html
<div class="dropdown-bar">
!!<button class="dropdown-anchor">!!!!!!!!!!!!!!!!
!!!!<div>Anchor</div>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    <div class="dropdown">
```

Creates a button that pops a dropdown menu. Can be nested inside of
`<div class="dropdown-bar">` but doesn't need to be. The inner unclassed 
`<div>` contains the button text. Nesting `<div class="dropdown">` inside of 
the button after the text creates the actual menu.

#### Attributes (default value in bold):

**`onset`**: **`"click"`** | `"hover"` Whether the menu is popped by clicking 
or hovering.

**`hoverdelay`**: number (default: **`"500"`**)
Delay in milliseconds before hovering pops the menu.

**`popdirection`**: **`"bottom-right"`** | `"bottom-left"` | `"top-right"` | 
`"top-left"` | `"right-bottom"` | `"right-top"` | `"left-bottom"` | 
`"left-top"` Controls where the menu appears relative to the anchor when it 
pops. The first direction determines the side of the anchor the menu appears on 
and the second direction determines the direction in which the menu's other 
axis is allowed to expand.

**`enabled`**: **`true`** | `false` 
Whether the menu button is enabled. If not enabled, the button's text will be
grayed out using the color defined with `--dropdown-disabled-font-color` and
will not pop its menu if pressed. If a link is applied with an `<a>` tag, it 
will automatically be disabled.

---

## `<div class="dropdown">`

```html
<button class="dropdown-anchor">
  <div>Anchor</div>
!!<div class="dropdown">!!!!!!!!!!!!!!!!
    <div class="dropdown-item">
```

Creates a dropdown menu. Must be nested inside of an element with the
`"dropdown-anchor"` class. Nesting `<div>` elements inside of the dropdown
creates menu items.

---

## `<div class="dropdown-spacer">`

```html
<button class="dropdown-anchor">
  <div>Anchor</div>
  <div class="dropdown">
!!!!<div class="dropdown-spacer"></div>!!!!!!!!!!!!!!!!
```

Creates an unselectable horizontal rule within the dropdown menu.

---

## `<div class="dropdown-item">`

```html
<div class="dropdown">
!!<div class="dropdown-item">!!!!!!!!!!!!!!!!
!!!!<div>Menu item</div>!!!!!!!!!!!!!!!!!!!!!
!!!!<a href="https://some-web-address"></a>!!
!!</div>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

Creates an item within the dropdown menu. All item content should be nested 
within the unclassed internal `<div>`. If the menu item requires a JavaScript 
click listener, the listener should be attached to this internal `<div>` 
element, which should have a custom class or ID attribute that can be used to 
locate it.

The optional inclusion of `<a>` allows you to create a link without having to 
define a JaveScript listener for the menu item. The text content of this `<a>` 
tag should be left blank.

An array of all of the menu items in a document can be generated by calling
`getMenuItems()`, or you can apply your own classes/IDs to them.

#### Attributes (applied to internal \<div>; default value in bold):

**`enabled`**: **`"true"`** | `"false"` Whether the menu item is enabled. If 
not enabled, the menu item's text will be grayed out using the color defined 
with `--dropdown-disabled-font-color` and if a link is present, it will be 
disabled.

Note that applying `enabled="false"` does not automatically disable a menu 
item's listener callback. If there is a JavaScript listener applied to the menu 
item, the listener must check whether the item's `.getAttribute("enabled")` 
equals `"false"` if it needs to identify a disabled state.

**`closeonselect`**: `"true"` | **`"false"`** Whether the menu should 
automatically close when this menu item is clicked.

---

## `<div class="dropdown-left">`

```html
<div class="dropdown">
  <div class="dropdown-item">
    <div>
!!!!!!<div class="dropdown-left">!!!!!!!!!!!!!!!!
!!!!!!!!<img src="./image.svg" />Includes icon!!!
!!!!!!</div>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    </div>
  </div>
```

Divides the left-aligned portion of a menu item into multiple units to allow 
the use of an icon with the item text. Both the image and the text should be
nested inside `<div class="dropdown-left">`.

To align the text of menu items without icons with the text of menu items that 
include icons, the former should use the `"dropdown-left"` class but replace 
the image with an empty `<div>` -- 
`<div class="dropdown-left"><div></div>Item text</div>` -- which creates an 
empty space instead of an icon.

---

## `<div class="dropdown-right">`

```html
<div class="dropdown">
  <div class="dropdown-item">
    <div>
      Includes shortcut
!!!!!!<div class="dropdown-right">Ctrl+I</div>!!!!!!!!!!!!!!!!
    </div>
  </div>
```

Creates a right-aligned unit within the menu item, which is normally used to
display a keyboard shortcut.

---

## `<div class="dropdown-expand">`

```html
<div class="dropdown">
!!<div class="dropdown-expand">!!!!!!!
!!!!<div>Submenu</div>!!!!!!!!!!!!!!!!
!!!!<div class="dropdown">!!!!!!!!!!!!
```

Like `<div class="dropdown-item">`, but also creates a nested submenu. Place 
`<div class="dropdown">` after the `<div>` element that contains the item 
content. Automatically creates an arrow beside the menu item to indicate a 
submenu.

#### Attributes (default value in bold):

**`popdirection`**: **`"right-bottom"`** | `"right-top"` | `"left-bottom"` | 
`"left-top"` Controls where the submenu appears relative to the menu item when 
it pops. The first direction determines the side of the menu item the submenu 
appears on and the second direction determines the direction in which the 
submenu's other axis is allowed to expand.

**`onset`**: `"click"` | **`"hover"`** Whether the menu is popped by clicking 
or hovering.

---

# Styling

The `.dropdown-anchor` section at the top of os-like-dropdown.css contains 
variables that can be modified to easily change the look of menus.

Of particular note, the menu animations can be disabled by setting the 
variables starting with `--dropdown-anim` to `0s`.

The simplest way of changing the menu size is to change `--dropdown-font-size` 
and `--dropdown-anchor-font-size`. Other default values scale with font size, 
so adjusting these values will scale the entire menu.
