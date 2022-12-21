import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Picker, Rating } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import axios from 'axios';

MapboxGL.setAccessToken('YOUR_ACCESS_TOKEN');

const SearchParlors = () => {
  const [parlors, setParlors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filteredParlors, setFilteredParlors] = useState([]);
  const [selectedParlor, setSelectedParlor] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Fetch the first page of results
    fetch(`http://localhost:8080/parlors?offset=${(page - 1) * 10}&limit=10`)
      .then((response) => response.json())
      .then((data) => {
        setParlors(data.results);
        setTotalPages(data.total_pages);
      });
  }, [page]);

  const handleSearch = () => {
    // Filter the list of parlors based on the search text, selected flavors, selected options, and selected price range
    setFilteredParlors(
      parlors.filter(
        (parlor) =>
          parlor.name.toLowerCase().includes(searchText.toLowerCase()) &&
          parlor.flavors.some((flavor) => selectedFlavors.includes(flavor)) &&
          parlor.options.some((option) => selectedOptions.includes(option)) &&
          (selectedPriceRange === 'all' ||
            (selectedPriceRange === 'low' && parlor.price < 10) ||
            (selectedPriceRange === 'medium' && parlor.price >= 10 && parlor.price < 20) ||
            (selectedPriceRange === 'high' && parlor.price >= 20))
     
      )
    );
  };

  const handleSelectParlor = (index) => {
    // Set the selected parlor based on the index of the tapped marker
    setSelectedParlor(filteredParlors[index]);
  };

  const handleNextPage = () => {
    // Go to the next page of results if it exists
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    // Go to the previous page of results if it exists
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleAddFavorite = () => {
    // Add the selected parlor to the list of favorite parlors in the database
    axios
      .post('http://localhost:8080/favorites', {
        parlor: selectedParlor,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search for ice cream parlors"
      />
      <Picker
        selectedValue={selectedPriceRange}
        onValueChange={setSelectedPriceRange}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="Low ($0 - $9.99)" value="low" />
        <Picker.Item label="Medium ($10 - $19.99)" value="medium" />
        <Picker.Item label="High ($20+)" value="high" />
      </Picker>
      <Picker
        selectedValue={selectedOptions}
        onValueChange={setSelectedOptions}
        mode="multi"
      >
        <Picker.Item label="Dairy-free" value="dairy-free" />
        <Picker.Item label="Vegan" value="vegan" />
        <Picker.Item label="Low-fat" value="low-fat" />
        <Picker.Item label="Sugar-free" value="sugar-free" />
      </Picker>
      <Button title="Search" onPress={searchAlimentation}
      </Button>

            <MapboxGL.MapView style={{ flex: 1 }}>
        {filteredParlors.map((parlor, index) => (
          <MapboxGL.PointAnnotation
            key={parlor.name}
            id={parlor.name}
            coordinate={[parlor.longitude, parlor.latitude]}
            onSelected={() => handleSelectParlor(index)}
          >
            <View style={styles.annotationContainer}>
              <View style={styles.annotationFill} />
            </View>
            <MapboxGL.Callout title={parlor.name} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
      {selectedParlor && (
        <View>
          <Text>Selected Parlor: {selectedParlor.name}</Text>
          <Text>Address: {selectedParlor.address}</Text>
          <Rating
            startingValue={selectedParlor.rating}
            readonly
            imageSize={20}
          />
          <Button title="Add to Favorites" onPress={handleAddFavorite} />
        </View>
      )}
      {page > 1 && (
        <Button title="Prev Page" onPress={handlePrevPage} />
      )}
      {page < totalPages && (
        <Button title="Next Page" onPress={handleNextPage} />
      )}
    </View>
  );
};

export default SearchParlors;
