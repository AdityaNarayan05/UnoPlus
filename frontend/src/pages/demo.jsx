import React, { useState, useEffect } from 'react';

function Demo() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // This effect will run after the component renders or when 'count' changes.
        setTimeout(() => {
            setCount(3);
        }, 3000);
        console.log('Effect ran');
    }, []);

    const incrementCount = () => {
        setCount(count + 1);
    };

    console.log("Hello");

    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={incrementCount}>Increment Count</button>
        </div>
    );
}

export default Demo;
