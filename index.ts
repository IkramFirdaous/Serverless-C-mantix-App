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

  // Extract the word from the URL query parameter
  const url = new URL(_req.url);
  const userWord = url.searchParams.get("word");

  // Validate that word parameter exists
  if (!userWord) {
    return new Response(
      JSON.stringify({ error: "Missing 'word' parameter" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

 
  const similarityRequestBody = JSON.stringify({
    word1: userWord,
    word2: "centrale", 
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://word2vec.nicolasfley.fr/similarity",
      requestOptions
    );

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `API Error: ${response.statusText}` }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const result = await response.json();

    console.log(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(
      JSON.stringify({ error: `Fetch error: ${error.message}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

Deno.serve(handler);