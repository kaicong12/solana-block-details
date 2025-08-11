"use client";

import { useState } from "react";
import Head from "next/head";

interface ITransactionCount {
  count: number;
  cached: boolean;
}

interface ApiResponse {
  blockNumber: number;
  transactionCount: ITransactionCount;
  timestamp?: string;
}

interface BlockExplorerProps {
  apiUrl: string;
}

export default function BlockExplorer({
  apiUrl,
}: Readonly<BlockExplorerProps>) {
  const [blockNumber, setBlockNumber] = useState<string>("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchTransactionCount = async () => {
    if (!blockNumber.trim()) {
      setError("Please enter a block number");
      return;
    }

    const blockNum = parseInt(blockNumber.trim());
    if (isNaN(blockNum) || blockNum < 0) {
      setError("Please enter a valid positive block number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${apiUrl}/solana/block/${blockNum}/transactions`
      );
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transaction count"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactionCount();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchTransactionCount();
    }
  };

  return (
    <>
      <Head>
        <title>Solana Block Transaction Counter</title>
        <meta
          name="description"
          content="Get transaction count for Solana blocks"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Solana Block Explorer
              </h1>
              <p className="text-blue-200">
                Get transaction count for any Solana block
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="blockNumber"
                  className="block text-sm font-medium text-blue-100 mb-2"
                >
                  Block Number
                </label>
                <input
                  id="blockNumber"
                  type="number"
                  min="0"
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Solana block number..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !blockNumber.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Fetching...</span>
                  </div>
                ) : (
                  "Get Transaction Count"
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 p-6 bg-green-500/20 border border-green-500/50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-100 mb-3">
                  Block Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-200">Block Number:</span>
                    <span className="text-white font-mono">
                      {result.blockNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-200">Transaction Count:</span>
                    <span className="text-white font-mono text-xl font-bold">
                      {result.transactionCount.count.toLocaleString()}
                    </span>
                  </div>
                  {result.timestamp && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-200">Timestamp:</span>
                      <span className="text-white font-mono text-sm">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-blue-300 text-xs">
                Connected to NestJS API on {apiUrl}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
