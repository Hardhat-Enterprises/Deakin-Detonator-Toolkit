import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@mantine/core";
// Defined type
type NewsItem = {
    title: string;
    link: string;
    description: string;
    pub_date: string;
};

export default function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchNews = () => {
        setRefreshing(true);
        invoke<NewsItem[]>("fetch_hacker_news")
            .then((result) => {
                setNews(result);
                setError("");
                setLastUpdated(new Date()); // ⏱️ Record refresh time
            })
            .catch((err) => {
                console.error("Error fetching news:", err);
                setError("Failed to load news");
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchNews(); // Initial fetch
    }, []);

    return (
        <div style={{ padding: "1rem" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>📰 Cybersecurity News</h2>
                <Button size="xs" variant="light" onClick={fetchNews} loading={refreshing}>
                    🔄 Refresh
                </Button>
            </div>

            {lastUpdated && (
                <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                    Last updated:{" "}
                    {new Intl.DateTimeFormat("en-AU", {
                        timeZone: "Australia/Melbourne",
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }).format(lastUpdated)}
                </p>
            )}

            {loading && <p>Loading news...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {news.map((item, index) => (
                    <li
                        key={index}
                        style={{
                            marginBottom: "1rem",
                            padding: "1rem",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            backgroundColor: "#1a1a1a",
                        }}
                    >
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#4dabf7",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                textDecoration: "none",
                            }}
                        >
                            {item.title}
                        </a>
                        <p style={{ fontSize: "0.8rem", color: "#aaa", margin: "0.3rem 0" }}>{item.pub_date}</p>
                        <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
