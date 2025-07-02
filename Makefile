up: cp-common-tools
	@docker compose up --build
cp-common-tools:
	@chmod +x ./scripts/cp_common_tools.sh
	@./scripts/cp_common_tools.sh
	@chmod -x ./scripts/cp_common_tools.sh

rm-common-tools:
	@chmod +x ./scripts/rm_common_tools.sh
	@./scripts/rm_common_tools.sh
	@chmod -x ./scripts/rm_common_tools.sh
down: rm-common-tools
	@docker compose down

clean: rm-common-tools
	@echo "Stopping running containers..."
	$(eval RUNNING_DOCKERS=`docker ps -qa`)
	@-docker stop $(RUNNING_DOCKERS)

	@echo "Removing containers..."
	$(eval BUILT_CONTAINERS=`docker ps -qa`)
	@-docker rm $(BUILT_CONTAINERS) > /dev/null 2>&1

	@echo "Removing images..."
	$(eval DOCKER_IMAGES=`docker images -qa`)
	@-docker rmi -f $(DOCKER_IMAGES) > /dev/null 2>&1

	@echo "Removing volumes..."
	$(eval DOCKER_VOLUMES=`docker volume ls -q`)
	@-docker volume rm $(DOCKER_VOLUMES) > /dev/null 2>&1

	@echo "Removing networks..."
	$(eval DOCKER_NETWORKS=`docker network ls -q`)
	@-docker network rm $(DOCKER_NETWORKS) > /dev/null 2>&1

fclean: clean
	@echo "Pruning..."
	@docker system prune -af

re: clean up
fre: fclean up