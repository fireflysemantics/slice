# User Documentation

This documentation attempts to enumerate the typical use cases that a 
central state store is used for and exlaborates on the use cases with a 
simple example.

## Setting the Application UI State on Boot

The `KeyValueStore` can be used to set the applications
user interface state on boot.

### Motivation

It provides a central point of access for services and components 
that need to understand what state the UI is in in order to do things
like set the layout or filter the display of values.

### Example

Suppose we have a dropdown select that for filtering `Todo` instances.
They can be filtered by `COMPLETE`, `INCOMPLETE`, or `ALL` values.  Thus 
within the `UIService` create a store:

```
export const enum TodoFilterSelectEnum {
  ALL = "All",
  COMPLETE = "Complete",
  INCOMPLETE = "Delete"
}
public uistate:KeyValueStore = new KeyValueStores();
uistate.post("todoFilterSelect",TodoFilterSelectEnum.ALL )

```

During `ngOnInit()` set the components state by retrieving it from the store:

```
this.activeTodoFilter$ = this.uiService.uistate.get("todoFilterSelect");
```