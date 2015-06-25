# ui-select-infinity
Extend `ui-select` with feature of infinity scrolling.

## Installing

```
bower install --save ui-select-infinity
```

## Example

```javascript

angular
    .module('SomeModule', ['ui-select-infinity'])
    .controller('SomeCtrl', function ($scope, $q) {
        var loadingItem = {type: 'loading'},
            hasNextChunk = true,
            queryString = '';
            
        function getInfinityScrollChunk(id) {
            //implement your lazy data request here
        }
            
        function addLoadingStateItem() {
            $scope.collections.push(loadingItem);
        }

        function removeLoadingStateItem() {
            var index = $scope.collections.indexOf(loadingItem);
            if (index < 0) {
                return;
            }
            
            $scope.collections.splice(index, 1);
        }
        
        
        $scope.isItemMatch = function($select) {
            //implement your match function here by $select.search   
        };
            
        $scope.requestMoreItems = function() {
            if ($scope.isRequestMoreItems || !hasNextChunk) {
                return $q.reject();
            }

            addLoadingStateItem();
            
            $scope.isRequestMoreItems = true;
            return getInfinityScrollChunk(nextChunkId)
                .then(function(newItems) {
                    nextChunkId = newItems.nextId;
                    $scope.items = $scope.items.concat($scope.newItems.items);
                    return newItems;
                }, function(err) {
                    return $q.reject(err);
                })
                .finally(function() {
                    removeLoadingStateItem();
                    $scope.isRequestMoreItems = false;
                });
        };
        
        $scope.refreshList = function() {
            queryString = query;
        };
    });

```

```html

<ui-select reach-infinity="requestMoreItems()">
    <ui-select-match placeholder="{{placeholder}}">
        {{$select.selected.name}}
    </ui-select-match>
    <ui-select-choices refresh="refreshList($select.search)"
                       refresh-delay="250"
                       repeat="item in items | filter: isItemMatch($select) track by item.id"
                       ui-disable-choice="collection.disabled">
      <span ng-switch="item.type">
        <span ng-switch-when="loading" style="height: 48px;line-height: 48px">
          <i>loading ...</i>
        </span>
        <span ng-switch-when="any">
          {{item.name}}
        </span>
      </span>
    </ui-select-choices>
</ui-select>

```
