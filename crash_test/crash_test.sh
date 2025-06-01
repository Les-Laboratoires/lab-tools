#!/bin/bash

check_logs() {
    if grep -q "Error" "$LOG_FILE" 2>/dev/null; then
        return 1
    fi
    return 0
}

LOG_FILE="./crash_test.log"
echo "" > "$LOG_FILE"  # clear

# run
BOT_PREFIX="!!" DB_DATABASE="lab_tools_test" npm run start > "$LOG_FILE" 2>&1 &
PID=$!

DURATION=10

echo "Processus lancé avec PID: $PID"
echo "Exécution pendant $DURATION secondes..."

for ((i=1; i<=DURATION; i++)); do
    # alive?
    if ! kill -0 $PID 2>/dev/null; then
        echo "Le processus s'est terminé prématurément"
        exit 1
    fi

    if ! check_logs; then
        echo "Erreur détectée dans les logs, arrêt du processus"
        kill $PID
        exit 1
    fi

    sleep 1
    echo -n "."
done
echo ""

echo "Arrêt du processus..."
kill $PID

TIMEOUT=3
for ((i=1; i<=TIMEOUT; i++)); do
    if ! kill -0 $PID 2>/dev/null; then
        echo "Processus terminé avec succès"
        exit 0
    fi
    sleep 1
done

if kill -0 $PID 2>/dev/null; then
    echo "Le processus ne répond pas, utilisation de SIGKILL"
    kill -9 $PID
fi

exit 0