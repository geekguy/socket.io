require 'honeybadger-api'
require 'openssl'
require 'redis'

def every_n_seconds(n)
  loop do
    before = Time.now
    yield
    interval = n-(Time.now-before)
    sleep(interval) if interval > 0
  end
end

redis = Redis.new

Honeybadger::Api.configure do |c|
  c.access_token = 'KxJxcVHD6XqGrUnHkixF'
end


every_n_seconds(10) do
	ps_faults = Honeybadger::Api::Fault.all(40475)

	redis.del('user-faults')
	ps_faults.each do |fault|
	  next if fault.resolved || fault.ignored
	  if redis.zrank('user-faults', fault.assignee).nil?
	    redis.zadd('user-faults', 1, fault.assignee)
	  else
	    redis.zincrby('user-faults', 1, fault.assignee)
	  end
	end
	puts redis.zrange('user-faults', 0, -1)
end
