# Architecture

### Model
    * Stores the current state of the drag and drop
    * Sends on the current state back out to the ViewModel

### ViewModel
    * Receives updates from the model and triggers a rerender of the View

### Controller
    * Binds events to the View
    * Handles the events and sends necessary data to the model

### Registry
    * Holds a registry of ViewModels so that they can be accessed anywhere

# Lifecycle

1. View mounts and attaches to its own ViewModel
2. ViewModel is registered in the Registry
3. Registry creates a binding between the ViewModel and Model
4. Registry creates a binding between the Controller and View
