# Open Source REST API Framework  

**Created by Delfa frost**  

Welcome to the Open Source REST API Framework—a lightweight and customizable solution designed to streamline API development. This framework allows developers to define endpoints effortlessly and ensures seamless integration within any application.  

---

## Table of Contents  

- [Introduction](#introduction)  
- [Features](#features)  
- [Getting Started](#getting-started)  
- [Adding an API Endpoint](#adding-an-api-endpoint)  
- [Example Endpoint](#example-endpoint)  
- [Automatic Endpoint Linking](#automatic-endpoint-linking)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Introduction  

This framework provides a simple yet powerful structure for building RESTful APIs. It enables rapid endpoint creation and automatic registration, making it perfect for both small projects and large-scale applications.  

---

## Features  

- **Modular Design**: Easily add or remove endpoints as separate modules.  
- **Automatic Endpoint Registration**: New endpoints are automatically recognized and registered.  
- **Lightweight**: Minimal dependencies for quick setup and performance.  
- **Customizable**: Tailor the framework to fit your specific project needs.  

---


## Adding an API Endpoint  

To add a new API endpoint, create a JavaScript file in the `api` directory with the following structure:  

```javascript  
exports.config = {  
    name: 'example', // The name of your API  
    author: 'Your_Name', // Your name or alias  
    description: 'API Description', // Brief description of your API  
    category: 'utility', // The category of your API (e.g., utility, data, etc.)  
    link: ['/example?q=test'] // Example link to access your API  
};  

exports.initialize = async function ({ req, res }) {  
    // Your API logic here  
};  
```  

- **`exports.config`**: Defines metadata for the API, including its name, author, description, category, and example link.  
- **`exports.initialize`**: Contains the main logic for the API endpoint, handling requests and responses.  

---

## Example Endpoint  

Here's an example of a simple "Hello World" API:  

```javascript  
exports.config = {  
    name: 'helloWorld',  
    author: 'Delfa frost',  
    description: 'Returns a Hello World message',  
    category: 'example',  
    link: ['/helloWorld']  
};  

exports.initialize = async function ({ req, res }) {  
    res.json({ message: 'Hello, World!' });  
};  
```  

This endpoint responds with a JSON object containing a greeting message when accessed.  

---

## Automatic Endpoint Linking  

The framework automatically registers and displays new API endpoints on the main website interface. There's no need to manually add links or update navigation menus.  

---

## Contributing  

Contributions are welcome! If you have ideas for improvements or new features, feel free to fork the repository and submit a pull request. Please ensure your contributions align with the project's coding standards and include appropriate documentation.  

---

## License  

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.  

---

If you find this project useful, please consider giving it a ⭐ on GitHub. Your support is greatly appreciated!  

Happy coding!  
