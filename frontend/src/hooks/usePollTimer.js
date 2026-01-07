import {useEffect, useState} from 'react';

export const usePollTimer = (initialSeconds) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        if(initialSeconds == null) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondsLeft(initialSeconds);

        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if(prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [initialSeconds]);

    return secondsLeft;
};