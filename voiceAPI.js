const VoiceRSS = {
    speech(options) {
        this._validate(options);
        this._request(options);
    },

    _validate(options) {
        if (!options) throw new Error("Settings are missing");
        if (!options.key) throw new Error("API key is required");
        if (!options.src) throw new Error("Text input is missing");
        if (!options.hl) throw new Error("Language setting is required");

        // Check if codec is supported
        if (options.c && options.c.toLowerCase() !== "auto") {
            let isSupported = false;
            const audio = new Audio();

            switch (options.c.toLowerCase()) {
                case "mp3":
                    isSupported = audio.canPlayType("audio/mpeg") !== "";
                    break;
                case "wav":
                    isSupported = audio.canPlayType("audio/wav") !== "";
                    break;
                case "aac":
                    isSupported = audio.canPlayType("audio/aac") !== "";
                    break;
                case "ogg":
                    isSupported = audio.canPlayType("audio/ogg") !== "";
                    break;
                case "caf":
                    isSupported = audio.canPlayType("audio/x-caf") !== "";
                    break;
            }

            if (!isSupported) throw new Error(`Browser does not support audio format: ${options.c}`);
        }
    },

    _request(options) {
        const requestData = this._buildRequest(options);
        const xhr = this._getXHR();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (xhr.responseText.startsWith("ERROR")) {
                    throw new Error(xhr.responseText);
                }
                
                // Play the generated speech
                const audioElement = new Audio(xhr.responseText);
                audioElement.play();
            }
        };

        xhr.open("POST", "https://api.voicerss.org/", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(requestData);
    },

    _buildRequest(options) {
        const codec = options.c && options.c.toLowerCase() !== "auto" ? options.c : this._detectCodec();
        return `key=${options.key || ""}&src=${options.src || ""}&hl=${options.hl || ""}&r=${options.r || ""}&c=${codec || ""}&f=${options.f || ""}&ssml=${options.ssml || ""}&b64=true`;
    },

    _detectCodec() {
        const audio = new Audio();
        if (audio.canPlayType("audio/mpeg")) return "mp3";
        if (audio.canPlayType("audio/wav")) return "wav";
        if (audio.canPlayType("audio/aac")) return "aac";
        if (audio.canPlayType("audio/ogg")) return "ogg";
        if (audio.canPlayType("audio/x-caf")) return "caf";
        return "";
    },

    _getXHR() {
        try {
            return new XMLHttpRequest();
        } catch (err) {
            console.error("XHR Error:", err);
        }

        // Older IE versions support ActiveX
        const versions = ["Msxml3.XMLHTTP", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (let version of versions) {
            try {
                return new ActiveXObject(version);
            } catch (err) {
                console.warn(`ActiveXObject Error for ${version}:`, err);
            }
        }

        throw new Error("This browser does not support HTTP requests");
    }
};
