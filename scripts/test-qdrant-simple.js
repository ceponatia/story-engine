/**
 * Simple Qdrant connectivity test
 */

const { QdrantClient } = require("@qdrant/js-client-rest");

async function testQdrantConnection() {
  console.log("Testing Qdrant connection...\n");

  try {
    const client = new QdrantClient({
      url: "http://localhost:6333",
      checkCompatibility: false,
    });

    // Test basic connectivity
    console.log("1. Testing basic connectivity...");
    const collections = await client.api("collections").getCollections();
    console.log(`   ✅ Connected to Qdrant successfully`);
    console.log(`   Current collections: ${collections.result?.collections?.length || 0}\n`);

    // Test creating a collection
    console.log("2. Creating test collection...");
    try {
      await client.createCollection("test_collection", {
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      });
      console.log("   ✅ Test collection created successfully\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("   ✅ Test collection already exists\n");
      } else {
        throw error;
      }
    }

    // Test storing a vector
    console.log("3. Testing vector storage...");
    const testVector = Array.from({ length: 768 }, () => Math.random() - 0.5);

    await client.upsert("test_collection", {
      points: [
        {
          id: "test-vector-1",
          vector: testVector,
          payload: {
            text: "This is a test vector",
            type: "test",
          },
        },
      ],
    });
    console.log("   ✅ Vector stored successfully\n");

    // Test searching
    console.log("4. Testing vector search...");
    const searchResult = await client.search("test_collection", {
      vector: testVector,
      limit: 5,
      with_payload: true,
    });

    console.log(`   ✅ Search completed, found ${searchResult?.length || 0} results`);
    if (searchResult && searchResult.length > 0) {
      console.log(`   Top result score: ${searchResult[0].score?.toFixed(4)}\n`);
    }

    // Cleanup
    console.log("5. Cleaning up...");
    await client.deleteCollection("test_collection");
    console.log("   ✅ Test collection deleted\n");

    console.log("🎉 Qdrant integration test successful!");
    console.log("Phase 2: Vector Database Integration is ready for deployment.");
  } catch (error) {
    console.error("❌ Qdrant test failed:", error.message);
    process.exit(1);
  }
}

testQdrantConnection();
