# Directories
SERVER_DIR = learnlink-server
UI_DIR = learnlink-ui
CURRENT_DIR = $(shell pwd)

# Commands
START_SERVER = cd $(CURRENT_DIR)/$(SERVER_DIR) && npm start
START_UI = cd $(CURRENT_DIR)/$(UI_DIR) && npm start
TEST_SERVER = cd $(CURRENT_DIR)/$(SERVER_DIR) && npm test 
TEST_UI = cd $(CURRENT_DIR)/$(UI_DIR) && npm test 
# Start both server and UI
start:
	@echo "INFO Starting both server and UI..."
	osascript -e 'tell application "Terminal" to do script "$(START_SERVER)"'
	osascript -e 'tell application "Terminal" to do script "$(START_UI)"'

start-server:
	@echo "INFO Starting server..."
	$(START_SERVER)

start-ui:
	@echo "INFO Starting UI..."
	$(START_UI)

test:
	@echo "INFO testing both server and UI..."
	osascript -e 'tell application "Terminal" to do script "$(TEST_SERVER)"'
	osascript -e 'tell application "Terminal" to do script "$(TEST_UI)"'

test-server:
	@echo "INFO testing server..."
	$(TEST_SERVER)

test-ui:
	@echo "INFO testing UI..."
	$(TEST_UI)

# Reset Server & UI Dependencies
reset: clean install
	@echo "INFO Resetting server and UI dependencies..."

# Install dependencies for server and UI
install: install-server install-ui
	@echo "INFO Installing dependencies for both server and UI..."

install-server:
	@echo "INFO Installing server dependencies..."
	cd $(SERVER_DIR) && npm install

install-ui:
	@echo "INFO Installing UI dependencies..."
	cd $(UI_DIR) && npm install
	
# Clean both server and UI
clean: clean-server clean-ui
	@echo "INFO Cleaning both server and UI..."

clean-server:
	@echo "INFO Cleaning server dependencies..."
	cd $(SERVER_DIR) && rm -rf node_modules && npm cache clean --force

clean-ui:
	@echo "INFO Cleaning UI dependencies..."
	cd $(UI_DIR) && rm -rf node_modules && npm cache clean --force
