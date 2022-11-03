import {onMounted, onUnmounted, reactive, ref} from "vue";
import {sleep} from "./utils";

// Composable that measures audio volume
export function useVolumeTracker() {
    // Value between 1 and 100 denoting volume level
    const maxVolume = ref(0);
    // State of microphone permissions
    const microphonePermission = reactive({
        permissionRequestAnswered: false,
        hasMicrophonePermission: false,
    });

    // The number of waveform samples to acquire in a single pass
    const AUDIO_SAMPLE_SIZE = 512;
    // The amount of audio maxima history to maintain
    const MAXIMA_MAX_AGE = AUDIO_SAMPLE_SIZE * 5;
    // Audio data buffer to be filled by the web audio api
    const audioData = new Uint8Array(AUDIO_SAMPLE_SIZE);
    // Current age of audio data, used for windowed max amplitude calculation
    let audioDataAge = 0;
    // Ordered list of max amplitude with ages for windowing
    const windowedVolumeMaxima = [];

    // Global audio context
    let audioCtx = null;
    // Audio analysis node that can provide waveform data
    let audioAnalyzer = null;

    // Read in waveform data and update the window of max volumes based on microphone input
    const updateMaxima = (audioIntensityData) => {
        let stepSize = 10;
        for (let i = 0; i < AUDIO_SAMPLE_SIZE; i += stepSize) {
            let maxInChunk = 128;
            for (let chunkIdx = 0; chunkIdx < stepSize; chunkIdx++) {
                if (audioIntensityData[i + chunkIdx] > maxInChunk) {
                    maxInChunk = audioIntensityData[i + chunkIdx];
                }
            }

            audioDataAge++;
            let maximaWindowEnd = audioDataAge - MAXIMA_MAX_AGE;
            // The audio samples come in as a sine wave going from 0 to 256 where 128 is the "zero" value
            // To measure volume, we just bring that baseline to 0, take absolute value, and make the result
            // a percentage of 128. Because we make the default max 128 it's effictively absolute value
            const value = maxInChunk - 128;

            // Remove the max value if it's too old (falls outside the window). The next highest value
            // in the measurement window takes its place.
            if (windowedVolumeMaxima.length > 0 && windowedVolumeMaxima[0].age < maximaWindowEnd) {
                windowedVolumeMaxima.shift();
            }

            // While the smallest maxima are SMALLER than the incoming value, remove them
            // This preserves an increasing order of maxima.
            while (windowedVolumeMaxima.length > 0 && windowedVolumeMaxima[windowedVolumeMaxima.length - 1].value < value) {
                windowedVolumeMaxima.pop();
            }

            // Add this value to the end of the maxima queue
            windowedVolumeMaxima.push({value, age: audioDataAge});
        }
    };

    // Start processing audio from the microphone. Returns a cancellation function.
    const processAudio = () => {
        let continueRunning = true;

        // Launches an audio processor running async that keeps running while continueRunning is true
        (async () => {
            if (!audioAnalyzer) {
                console.error("No access to analyzer! Quitting.");
                audioDataAge = 0;
                return;
            }

            while (continueRunning) {
                audioAnalyzer.getByteTimeDomainData(audioData);

                updateMaxima(audioData);
                // UpdateMaxima maintains maxima in a range of 0 to 128. We store max volume as 0 to 100
                maxVolume.value = (Math.min(windowedVolumeMaxima[0].value, 128) / 128) * 100;

                // Allow other UI thread code to run
                await sleep(10);
            }
        })().then(() => console.log("Complete!"));

        // When this callback is invoked the async process stops running
        return () => continueRunning = false;
    };

    // Request access to the microphone so we can start measuring volume levels
    const requestMicrophoneAccess = async () => {
        microphonePermission.permissionRequestAnswered = false;

        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioSource = await navigator.mediaDevices.getUserMedia({audio: true});
            const audioStream = audioCtx.createMediaStreamSource(audioSource);
            const gain = audioCtx.createGain();
            audioAnalyzer = audioCtx.createAnalyser();
            audioAnalyzer.fftSize = AUDIO_SAMPLE_SIZE;

            audioStream.connect(gain).connect(audioAnalyzer);
            microphonePermission.hasMicrophonePermission = true;
            microphonePermission.permissionRequestAnswered = true;
        } catch (err) {
            microphonePermission.hasMicrophonePermission = false;
            microphonePermission.permissionRequestAnswered = true;
            console.error("User denied microphone permission.")
            console.error(err);
        }
    }

    return {
        maxVolume,
        microphonePermission,
        requestMicrophoneAccess,
        processAudio,
    }
}