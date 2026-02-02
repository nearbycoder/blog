---
title: "Getting Around API Rate Limiting"
description: "Anyone who has had to work with an external API knows the problems that can occur when there are a lot of users hitting endpoints that directly pull from the external API's."
date: "2016-05-19"
tags: ["backend", "performance", "redis"]
readTime: "7 min read"
featured: false
accent: "mist"
---

Anyone who has had to work with an external API knows the problems that can occur when there are a lot of users hitting endpoints that directly pull from the external API's. For example, we recently ran into an issue where we were polling an external API rapidly enough to bump into the service's 10 requests/second rate limit. The information we were trying to gather was crucial to the application we were building, so we needed to find a way around this rate limit.

This is where redis came in. Redis is a key-value in-memory data structure store, used as database, cache and message broker. The data that we are trying to cache is a ruby hash which can easily be converted into a JSON structure. Redis allows for storing JSON objects which makes for a great paring between the API that we are calling and storing within Redis. In addition since we can save the entire API call into cache we can do a bulk list query rather than querying for individual records. This will significantly decrease the calls needed to make for the API. The library that housed this API also included a way to rehydrate a object based on a JSON-consuming initializer. This meant that although we are storing JSON into Redis, when we need to grab the cache we still have the full object as if it was pulled directly from the API.

Below is an example mockup of using Redis

```ruby


class CachedWorker
  require 'redis'

  def list
    # Calling Redis.new provides a default URL of localhost
    redis = Redis.new
    # Create an empty array to push workers to
    workers = []
    # Check to make sure that the redis store has any workers stored
    if !redis.keys('workers:*').empty?
        #scan over all entries in the workers: namespace and convert to ExternalApi:Worker and push to workers array
        redis.scan_each(match: 'workers:*') do |key|
            cached_worker = redis.get key
            begin
                worker = ExternalApi::Worker.new(JSON.parse(cached_worker))
                workers << worker
            rescue TypeError, JSON::ParserError => e
                # delete any invalid key
                redis.del(key)
            end
        end
    else
        # refresh cache for Redis by getting the ExternalApi:Workers from the api call
        workers = ExternalApi::Worker.list.each do |worker|
            redis.set namespaced_id(worker.id), worker.to_json
            redis.expire namespaced_id(worker.id), 60 * 3
        end
    end

    # return the array of ExternalApi:Worker
    return workers
  end

  def self.namespaced_id(id)
    "workers:#{id}"
  end
end

```

The code above will first go out and check the Redis cache to see if the namespace workers is empty. If the namespace is not empty it will attempt to pull the external API info from Redis. If the Redis namespace is empty it will go out and grab the worker information we require from the external API and set it to expire within 3 minutes. In our case this information changes only on certain updates and we can handle this by invalidating and recaching the workers when we update a certain model. Because JSON parsing is quite particular about data formatting and errors could halt the entire worker list compilation process, we wrap the worker instantiation and JSON parsing operation in a rescue block to catch any errors. If a key is found to have data that's not valid JSON, we remove that key to prevent further problems.

This routine may not work for all external API's. For example if you are pulling from twitter you want to get the latest and greatest info and may not want to have to wait 3 minutes. However if you are trying to pull in the same info repeatedly within a few minutes then Redis caching can help clear up any rate limiting problems that might occur.
