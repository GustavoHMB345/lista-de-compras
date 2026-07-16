SuperLista is a comprehensive mobile application developed in React Native, designed to manage shopping lists in a collaborative and intelligent way. It allows families to create and share lists, add items with prices and quantities, and, most importantly, analyze the price evolution of products over time, helping to save money and shop more consciously.

The project was developed with a focus on a smooth user experience and operates completely offline, saving all data locally on the device.

## Key Features

* **Family Management:** Create a family group and invite members to participate.
* **Shared Lists:** Create shopping lists that can be edited by multiple family members in real-time (either on the same network or on the same device, since it operates locally).
* **Item Addition:** Add products with name, quantity, and price (optional).
* **Purchase Marking:** Mark items as "purchased" with a smooth animation.
* **Smart Dashboard:** A home screen that shows the top 5 most purchased items by the family and their average price.
* **Price History:** View the average price of all previously purchased products, ordered from cheapest to most expensive.
* **Advanced Item Analysis:** Tap an item in the history to view a detailed chart of its price fluctuation over time.
* **Personal Profile:** Manage your display name.
* **Smooth Interface:** Animations and transitions that make the user experience more pleasant and professional.
* **Local Storage:** All data is securely saved on the device using AsyncStorage, ensuring offline operation.


### Dashboard, Price History, and Item Detail
* **Dashboard:** [Dashboard Image]
* **Price History:** [Price History Screen Image]
* **Item Detail:** [Price Fluctuation Chart Image]

### Active Lists, List Detail, and Family Management
* **Active Lists:** [Lists Screen Image]
* **List Detail:** [List Detail Screen Image]
* **Family Management:** [Family Screen Image]

## Technologies Used

* **React Native:** A framework for building cross-platform mobile applications.
* **Expo:** A platform and toolset to facilitate the development and execution of React Native apps.
* **AsyncStorage:** For local data storage on the device.
* **React Context API:** For simple and efficient global state management.
* **React Native Gifted Charts:** For creating interactive bar and line charts.

## Project Structure

The source code is organized in the `src` folder to facilitate maintenance and scalability:

```text
/src
|-- /components     # Reusable components (NavBar, Icons)
|-- /contexts       # Global state management (DataContext)
|-- /navigation     # Navigation logic between screens (MainNavigator)
|-- /screens        # Individual screen components
|-- /styles         # Global styles file
