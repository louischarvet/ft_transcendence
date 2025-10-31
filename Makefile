backend_file=backend/docker-compose.yml

backend:
	@docker compose -f $(backend_file) up --build

backend-clean:
	@echo "Stopping running containers..."
	@docker compose -f $(backend_file) down -v

up:
	@docker compose up --build

up-d:
	@docker compose up -d --build
	@echo "✅ Containers launched in detached mode. Showing logs..."
	@docker compose logs -f

down:
	@docker compose down

build:
	@docker compose build

start:
	@docker compose start

stop:
	@docker compose stop

restart:
	@docker compose restart

image:
	@docker compose images

logs:
	@docker compose logs -f

ps:
	@docker compose ps

clean:
	@echo "Stopping running containers..."
	@docker ps -q | xargs -r docker stop

	@echo "Removing containers..."
	@docker ps -aq | xargs -r docker rm

	@echo "Removing images..."
	@docker images -q | xargs -r docker rmi -f

	@echo "Removing volumes..."
	@docker volume ls -q | xargs -r docker volume rm

	@echo "Removing networks..."
	@docker network ls --format "table {{.Name}}" | tail -n +2 | grep -vE "^(bridge|host|none)$$" | xargs -r docker network rm

fclean: clean
	@echo "Pruning..."
	@docker system prune -af

re: clean up
fre: fclean up

.PHONY: backend backend-clean up down build start stop restart image logs ps clean fclean re fre
