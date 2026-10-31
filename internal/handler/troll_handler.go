package handler

import (
	"fmt"
	"net/http"
	"time"
)

func TrollBotHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Expected http.ResponseWriter to be an http.Flusher", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusTeapot)
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		flusher.Flush()

		for i := 1; ; i++ {
			select {
			case <-r.Context().Done():
				return
			default:
				fmt.Fprintf(w, "Troll level %d... Holding your thread...\n", i)
				flusher.Flush()
				time.Sleep(10 * time.Second)
			}
		}
	}
}
