/*
 * The various error messages.  Generally consumed by the ErrorCtrl.
 */
appModule.constant("ERROR_MESSAGES", {
    HTTP_403: {
        title: "Forbidden",
        message: "You are not authorized to see that resource.  Please contact the service desk if this issue persists."
    },
    HTTP_500: {
        title: "Error on Server",
        message: "An unexpected error occurred on the server.  Please contact the service desk if this issue persists."
    },
    HTTP_UNEXPECTED: {
        title: "Error Communicating with Server",
        message: "An unexpected error occurred while communicating with the server.  Please contact the service desk if this issue persists."
    },
    APPLICATION_ERROR: {
        title: "Application Error",
        message: "An unexpected error occurred in the web application.  Please contact the service desk if this issue persists."
    },
    API_ERROR: {
        title: "Error Calling Service",
        message: "There was an error calling a client side service: ",
        altMessage: "No message returned."
    }
});