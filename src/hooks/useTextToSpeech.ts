"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type TextToSpeechOptions = {
    lang?: string;
    voiceName?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
};

export type UseTextToSpeechReturn = {
    speak: (text: string, options?: TextToSpeechOptions) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    voices: SpeechSynthesisVoice[];
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
};

const defaultOptions: Required<Omit<TextToSpeechOptions, "voiceName">> = {
    lang: "en-US",
    rate: 1,
    pitch: 1,
    volume: 1,
};

export function useTextToSpeech(initialOptions?: TextToSpeechOptions): UseTextToSpeechReturn {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    const mergedInitialOptions = useMemo(
        () => ({
        ...defaultOptions,
        ...initialOptions,
        }),
        [initialOptions]
    );

    useEffect(() => {
        setIsSupported(
            typeof window !== "undefined" && "speechSynthesis" in window
        );
    }, []);

    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        };

        loadVoices();

        window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

        return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
        };
    }, [isSupported]);

    const findVoice = useCallback(
        (options: TextToSpeechOptions) => {
        if (!voices.length) return undefined;

        if (options.voiceName) {
            const selectedVoice = voices.find(
            (voice) => voice.name === options.voiceName
            );

            if (selectedVoice) return selectedVoice;
        }

        const lang = options.lang ?? mergedInitialOptions.lang;

        return (
            voices.find((voice) => voice.lang === lang) ||
            voices.find((voice) => voice.lang.startsWith("en")) ||
            voices[0]
        );
        },
        [voices, mergedInitialOptions.lang]
    );

    const speak = useCallback(
        (text: string, options?: TextToSpeechOptions) => {
        if (!isSupported) return;

        const normalizedText = text.trim();

        if (!normalizedText) return;

        window.speechSynthesis.cancel();

        const finalOptions = {
            ...mergedInitialOptions,
            ...options,
        };

        const utterance = new SpeechSynthesisUtterance(normalizedText);

        utterance.lang = finalOptions.lang;
        utterance.rate = finalOptions.rate;
        utterance.pitch = finalOptions.pitch;
        utterance.volume = finalOptions.volume;

        const selectedVoice = findVoice(finalOptions);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        },
        [isSupported, mergedInitialOptions, findVoice]
    );

    const stop = useCallback(() => {
        if (!isSupported) return;

        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, [isSupported]);

    const pause = useCallback(() => {
        if (!isSupported) return;

        window.speechSynthesis.pause();
        setIsPaused(true);
    }, [isSupported]);

    const resume = useCallback(() => {
        if (!isSupported) return;

        window.speechSynthesis.resume();
        setIsPaused(false);
    }, [isSupported]);

    return {
        speak,
        stop,
        pause,
        resume,
        voices,
        isSpeaking,
        isPaused,
        isSupported,
    };
}
