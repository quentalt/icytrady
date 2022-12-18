package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Parlor represents an ice cream parlor that makes traditional ice cream.
type Parlor struct {
	Name    string   `json:"name"`
	Address string   `json:"address"`
	Flavors []string `json:"flavors"`
}

// Parlors is a list of ice cream parlors.
type Parlors []Parlor

// parlors is a list of ice cream parlors that make traditional ice cream.
var parlors = Parlors{
	{
		Name:    "Scoops Ice Cream Parlor",
		Address: "123 Main St, Anytown, USA",
		Flavors: []string{"vanilla", "chocolate", "strawberry"},
	},
	{
		Name:    "Tastee Treats Ice Cream Shop",
		Address: "456 Park Ave, Anytown, USA",
		Flavors: []string{"mint chocolate chip", "rocky road", "chocolate chip cookie dough"},
	},
	// Additional parlors can be added here.
}

func main() {
	r := gin.Default()

	// Get a list of ice cream parlors
	r.GET("/parlors", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusOK, parlors)
	})

	// Create a new ice cream parlor
	r.POST("/parlors", func(c *gin.Context) {
		var parlor Parlor
		if err := c.ShouldBindJSON(&parlor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		parlors = append(parlors, parlor)
		c.JSON(http.StatusCreated, parlor)
	})

	// Update an existing ice cream parlor
	r.PUT("/parlors/:name", func(
	c *gin.Context) {
		name := c.Param("name")
		var parlor Parlor
		if err := c.ShouldBindJSON(&parlor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		for i, p := range parlors {
			if p.Name == name {
				parlors[i] = parlor
				c.JSON(http.StatusOK, parlor)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "parlor not found"})
	})

	// Delete an ice cream parlor
	r.DELETE("/parlors/:name", func(c *gin.Context) {
		name := c.Param("name")
		for i, p := range parlors {
			if p.Name == name {
				parlors = append(parlors[:i], parlors[i+1:]...)
				c.JSON(http.StatusOK, gin.H{"success": "parlor deleted"})
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "parlor not found"})
	})
