function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    return handlePreFlightRequest();
  }

  // Define the target word that users need to guess
  const TARGET_WORD = "centrale";

  try {
    // Extract the word from the request URL
    const url = new URL(_req.url);
    const userGuess = url.searchParams.get("word");

    if (!userGuess) {
      return new Response(JSON.stringify({ error: "Word parameter is required in URL query string" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    // Compare user's guess with the target word using the comparison API
    const similarityRequestBody = JSON.stringify({
      word1: TARGET_WORD,
      word2: userGuess,
    });

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: similarityRequestBody,
      redirect: "follow",
    };

    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(JSON.stringify({ error: response.statusText }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const result = await response.json();

    console.log(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }
}

Deno.serve(handler);