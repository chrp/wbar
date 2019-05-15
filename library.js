mergeInto(LibraryManager.library, {
    on_detected_callback: function (detected_code) {
        const UTF8ToString = Module['UTF8ToString'];
        // call the processing function that has been set by JS
        const callback = Module['onDetected'];
        if (callback == null) {
            throw new Error("No callback function set")
        }
        callback(UTF8ToString(detected_code))
    }
});
