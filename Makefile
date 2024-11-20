# Directories
SERVER_DIR = learnlink-server
UI_DIR = learnlink-ui
CURRENT_DIR = $(shell pwd)

# Commands
START_SERVER = cd $(CURRENT_DIR)/$(SERVER_DIR) && npm start
START_UI = cd $(CURRENT_DIR)/$(UI_DIR) && npm start

# Start both server and UI
start:
	osascript -e 'tell application "Terminal" to do script "$(START_SERVER)"'
	osascript -e 'tell application "Terminal" to do script "$(START_UI)"'


start-server:
	@echo "Starting server..."
	$(START_SERVER)

start-ui:
	@echo "Starting UI..."
	$(START_UI)

# Install dependencies for server and UI
install: install-server install-ui

install-server:
	@echo "Installing server dependencies..."
	cd $(SERVER_DIR) && npm install

install-ui:
	@echo "Installing UI dependencies..."
	cd $(UI_DIR) && npm install

# Clean both server and UI
clean: clean-server clean-ui

clean-server:
	@echo "Cleaning server..."
	cd $(SERVER_DIR) && npm run clean

clean-ui:
	@echo "Cleaning UI..."
	cd $(UI_DIR) && npm run clean
