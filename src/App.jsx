import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useState, useEffect } from "react";
import Papa from "papaparse";

function App() {
  const [data, setData] = useState([]);
  const [jan, setJan] = useState("");
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const normalizeJan = (code) => {
    if (!code) return "";
    return code.toString().padStart(13, "0");
  };

  const formatProductCode = (code) => {
    if (!code) return "";
    return code.toString().padStart(10, "0");
  };

  // ▼ CSV を読み込む（Vercel対応）
  useEffect(() => {
    fetch("/inventory.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });
        setData(parsed.data);
      });
  }, []);

  const handleSearch = () => {
    const normalizedJanInput = normalizeJan(jan);

    const hit = data.find(
      (item) =>
        normalizeJan(item["JANコード"]) === normalizedJanInput ||
        item["商品コード"] === jan
    );

    setResult(hit || "notfound");
  };

  const handleReset = () => {
    setJan("");
    setResult(null);
  };

  const valueStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#ffffff",
  };

  const labelStyle = {
    color: "#007bff",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        color: "white",
        backgroundColor: "#1C1C1E",
        minHeight: "100vh",
      }}
    >
      {/* ① タイトル小さく＆1行固定 */}
      <h1
        style={{
          fontSize: "24px",
          marginBottom: "20px",
          textAlign: "center",
          whiteSpace: "nowrap",
          fontFamily: `"Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN", sans-serif`,
        }}
      >
        棚ロケーション検索アプリ
      </h1>

      <input
        type="text"
        placeholder="JANコードを入力"
        value={jan}
        onChange={(e) => setJan(e.target.value)}
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />

      <button
        onClick={handleSearch}
        style={{ padding: "8px 16px", marginRight: "10px" }}
      >
        検索
      </button>

      <button onClick={handleReset} style={{ padding: "8px 16px" }}>
        リセット
      </button>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        {/* ④ カメラ起動／閉じる */}
        <button
          onClick={async () => {
            if (showCamera) {
              setShowCamera(false);
              return;
            }

            try {
              await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
              });
              setShowCamera(true);
            } catch (e) {
              console.error("カメラ許可が必要です", e);
            }
          }}
          style={{
            padding: "10px 20px",
            background: showCamera ? "#f66" : "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {showCamera ? "カメラを閉じる" : "カメラを起動"}
        </button>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "12px",
          color: "#cccccc",
        }}
      >
        ※在庫数はAM9時時点のデータです。実在庫とは差異の可能性があります。
      </p>

      {showCamera && navigator.mediaDevices && (
        <div
          style={{
            marginTop: "20px",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p>カメラでJANコードを読み取る：</p>

          {/* ▼ カメラ＋ストライクゾーン＋点滅 */}
          <div
            id="camera-wrapper"
            style={{
              position: "relative",
              width: 300,
              height: 300,
              overflow: "hidden",
            }}
          >
            {/* ▼ カメラ映像 */}
            <BarcodeScannerComponent
              width={300}
              height={300}
              facingMode="environment"
              onUpdate={(err, result) => {
                if (result) {
                  setJan(result.text);
                  handleSearch();

                  // ▼ A：赤いフラッシュ点滅
                  const flash = document.getElementById("flash-effect");
                  if (flash) {
                    flash.style.opacity = "1";
                    setTimeout(() => {
                      flash.style.opacity = "0";
                    }, 150);
                  }
                }
              }}
            />

            {/* ▼ 点滅エフェクト */}
            <div
              id="flash-effect"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255,0,0,0.4)",
                opacity: 0,
                transition: "opacity 0.15s",
                pointerEvents: "none",
              }}
            />

            {/* ▼ ［　　］コーナー枠 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {/* 左上 */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 40,
                  height: 40,
                  borderTop: "4px solid red",
                  borderLeft: "4px solid red",
                }}
              />
              {/* 右上 */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  borderTop: "4px solid red",
                  borderRight: "4px solid red",
                }}
              />
              {/* 左下 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 40,
                  borderBottom: "4px solid red",
                  borderLeft: "4px solid red",
                }}
              />
              {/* 右下 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  borderBottom: "4px solid red",
                  borderRight: "4px solid red",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        {result === "notfound" && <p>該当データがありません。</p>}

        {result && result !== "notfound" && (
          <div>
            <h2>検索結果</h2>

            <p>
              <span style={labelStyle}>JANコード:</span>{" "}
              <span style={valueStyle}>{result["JANコード"]}</span>
            </p>
            <p>
              <span style={labelStyle}>商品ｺｰﾄﾞ:</span>{" "}
              <span style={valueStyle}>
                {formatProductCode(result["商品ｺｰﾄﾞ"])}
              </span>
            </p>
            <p>
              <span style={labelStyle}>メーカー名:</span>{" "}
              <span style={valueStyle}>{result["メーカー名"]}</span>
            </p>
            <p>
              <span style={labelStyle}>商品名:</span>{" "}
              <span style={valueStyle}>{result["商品名"]}</span>
            </p>
            <p>
              <span style={labelStyle}>属性名１:</span>{" "}
              <span style={valueStyle}>{result["属性名１"]}</span>
            </p>
            <p>
              <span style={labelStyle}>棚ロケ:</span>{" "}
              <span style={valueStyle}>{result["棚ロケ"]}</span>
            </p>
            <p>
              <span style={labelStyle}>棚番:</span>{" "}
              <span style={valueStyle}>{result["棚番"]}</span>
            </p>
            <p>
              <span style={labelStyle}>在庫数:</span>{" "}
              <span style={valueStyle}>{result["在庫"]}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
