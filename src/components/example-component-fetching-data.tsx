"use client";
import { useEffect, useState } from "react";



export default function ExampleComponentFetchingData() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch("/api/options_transactions")
            .then((res) => {
                if (!res.ok) throw new Error(res.statusText || "Failed to fetch");
                return res.json();
            })
            .then((json) => {
                if (mounted) setData(json || []);
            })
            .catch((err) => {
                if (mounted) setError(err?.message ?? "Unknown error");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching data: {error}</div>;

    return (
        <div>
            <h3>Data fetched from Neon will show up here</h3>
            <h4>Edit the example component with an actual table name and print the data</h4>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}