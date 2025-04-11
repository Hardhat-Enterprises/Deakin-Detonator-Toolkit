import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@mantine/core";

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = () => {
    setRefreshing(true);
    invoke<NewsItem[]>("fetch_hacker_news")
      .then((result) => {
        setNews(result);
        setLoading(false);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        setError("Failed to load news");
        console.error(err);
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchNews(); // initial fetch
    const intervalId = setInterval(fetchNews, 3600000); // every hour
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📰 Cybersecurity News</h2>
        <Button size="xs" variant="light" onClick={fetchNews} loading={refreshing}>
          🔄 Refresh
        </Button>
      </div>

      {loading && <p>Loading news...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {lastUpdated && (
        <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "1rem" }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {news.map((item, index) => (
          <li
            key={index}
            style={{
              marginBottom: "1.5rem",
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
              style={{ color: "#4dabf7", fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {item.title}
            </a>
            <p style={{ fontSize: "0.85rem", color: "#aaa", margin: "0.2rem 0" }}>{item.pub_date}</p>
            <p style={{ fontSize: "1rem", color: "#ccc" }}>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
